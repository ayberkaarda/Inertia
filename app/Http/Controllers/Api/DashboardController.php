<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Workspace; 
use App\Models\User;
use App\Models\Sprint;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 💀 SESSİZ PASLANMA MOTORUNU ÇALIŞTIR
        $this->processSkillDecay();

        $user = request()->user();
        
        // Kullanıcının yetenek ve rozetlerini önden yüklüyoruz (Algoritma için gerekli)
        $user->loadMissing(['skills', 'badges']);

        // 1. GLOBAL SYNERGY
        $globalSynergy = $this->calculateGlobalSynergy();
        
        // 2. SKILL MATCH RATE
        $userMatchRate = $this->calculateUserSkillMatchRate($user);
        
        // 3. SKILL BALANCE
        $totalSystemSkills = Skill::count() ?: 1;
        $userUniqueSkillsCount = DB::table('user_skill')
            ->where('user_id', $user->id)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->distinct('skill_id')
            ->count();
            
        $balanceScore = round(($userUniqueSkillsCount / $totalSystemSkills) * 10);
        $balanceDisplay = max(1, $balanceScore) . "/10";

        // 4. DİNAMİK GRAFİK VERİSİ
        $chartData = $this->getEfficiencyData();

        // 🌟 ZOMBİ KALKANI: Sadece aktif sprintlerin ID'lerini al
        $activeSprintIds = Sprint::where('status', 'active')->pluck('id')->toArray();

        // 🌟 AKILLI ÖNERİ MOTORU: Kullanıcının Yetenek + Rozetlerine göre aktif görevleri tara
        $smartSuggestion = $this->getSmartSuggestion($user, $activeSprintIds);

        return response()->json([
            'skill_match_rate' => (int)$userMatchRate,
            'avg_complexity' => round(Card::avg('complexity_level'), 1) ?: 5.0,
            'bottleneck_alerts' => Card::where('complexity_level', '>=', 8)->where('is_completed', false)->count(),
            'global_synergy' => (int)$globalSynergy,
            'skill_balance' => $balanceDisplay,
            'efficiency_data' => $chartData,
            
            // 🌟 FİLTRELENDİ: Sadece aktif sprintteki bitmemiş görevleri tabloya bas
            'tasks' => Card::with(['users', 'requiredSkills', 'badges'])
                ->where('is_completed', false)
                ->whereIn('sprint_id', $activeSprintIds)
                ->latest()
                ->take(3)
                ->get(),
                
            // 🌟 YENİ EKLENDİ: Ekrana basılacak en uygun görev
            'smart_suggestion' => $smartSuggestion,

            'active_sprints_list' => Sprint::where('status', 'active')->with('tasks.users')->latest()->take(3)->get(),
            'active_sprints' => count($activeSprintIds),
            'dbTalent' => User::all(['id', 'name', 'email', 'avatar']),
            'notifications' => $user->notifications()->latest()->take(10)->get(),
            
            'search_workspaces' => Workspace::latest()->take(20)->get(['id', 'name', 'slug']),
            'search_tasks'      => Card::with('requiredSkills')->latest()->take(50)->get(),
            'search_users'      => User::latest()->take(50)->get(['id', 'name', 'email', 'avatar']),
            'search_sprints'    => Sprint::latest()->take(20)->get(['id', 'name', 'status']),
        ]);
    }

    /**
     * 🧠 SMART SUGGESTION MOTORU (Sadece Aktif Görevler İçin)
     * Kullanıcının yetenek ve rozetlerini birleştirip en yüksek eşleşen görevi bulur.
     */
    private function getSmartSuggestion($user, $activeSprintIds)
    {
        // Kullanıcının yeteneklerini ve rozetlerini küçük harfe çevirip tek bir havuzda birleştiriyoruz
        $userKeywords = array_merge(
            $user->skills->pluck('name')->map(fn($s) => strtolower($s))->toArray(),
            $user->badges->pluck('name')->map(fn($b) => strtolower($b))->toArray()
        );

        // Sadece AKTİF sprintlerdeki ve bitmemiş görevleri çek
        $activeCards = Card::with('requiredSkills')
            ->where('is_completed', false)
            ->whereIn('sprint_id', $activeSprintIds)
            ->get();

        if ($activeCards->isEmpty()) {
            return null; // Aktif görev yoksa önerme
        }

        $bestCard = null;
        $bestMatchRate = 0;

        foreach ($activeCards as $card) {
            $reqSkills = $card->requiredSkills->pluck('name')->map(fn($s) => strtolower($s))->toArray();
            
            // Eğer görevin hiçbir yetenek gereksinimi yoksa, herkes için %50 temel eşleşme ver
            if (empty($reqSkills)) {
                $matchRate = 50; 
            } else {
                // Görevin istediği yeteneklerle, kullanıcının rozet+yetenek havuzunu kesiştir
                $intersect = array_intersect($userKeywords, $reqSkills);
                $matchRate = (count($intersect) / count($reqSkills)) * 100;
            }

            // En yüksek eşleşmeyi bul
            if ($matchRate >= $bestMatchRate) {
                $bestMatchRate = $matchRate;
                $bestCard = $card;
            }
        }

        // Eğer en iyi eşleşme %0 ise (adamın hiçbir alakası yoksa) null dön, alakasız görev önerme
        if ($bestMatchRate == 0 && count($userKeywords) > 0) {
            return null;
        }

        return [
            'card' => $bestCard,
            'match_rate' => round($bestMatchRate)
        ];
    }

    // --- AŞAĞIDAKİ YARDIMCI FONKSİYONLARIN AYNI KALDI ---

    private function getEfficiencyData()
    {
        $data = Card::select(
            DB::raw('MONTH(created_at) as month_num'),
            DB::raw('SUM(complexity_level * 5) as estimated'),
            DB::raw('SUM(CASE WHEN is_completed = 1 THEN complexity_level * 4.8 ELSE 0 END) as actual')
        )
        ->whereYear('created_at', date('Y'))
        ->groupBy('month_num')
        ->orderBy('month_num')
        ->get();

        if ($data->isEmpty()) {
            return [['month' => Carbon::now()->format('M'), 'estimated' => 0, 'actual' => 0]];
        }

        return $data->map(function($item) {
            return [
                'month' => Carbon::create()->month($item->month_num)->format('M'),
                'estimated' => (int)$item->estimated,
                'actual' => (int)$item->actual
            ];
        })->values()->toArray();
    }

    private function calculateGlobalSynergy()
    {
        $assignedCards = Card::has('users')->with('requiredSkills', 'users')->get();
        if ($assignedCards->isEmpty()) return 85; 

        $totalRate = 0;
        $totalAssignments = 0;

        foreach ($assignedCards as $card) {
            $requiredIds = $card->requiredSkills->pluck('id')->toArray();
            if (empty($requiredIds)) continue;

            foreach ($card->users as $u) {
                $userSkillIds = DB::table('user_skill')
                    ->where('user_id', $u->id)
                    ->where(function($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    })
                    ->pluck('skill_id')->toArray();
                    
                $matches = array_intersect($userSkillIds, $requiredIds);
                $totalRate += (count($matches) / count($requiredIds)) * 100;
                $totalAssignments++;
            }
        }

        return $totalAssignments > 0 ? round($totalRate / $totalAssignments) : 85;
    }

    private function calculateUserSkillMatchRate($user)
    {
        $userSkillIds = DB::table('user_skill')
            ->where('user_id', $user->id)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->pluck('skill_id')->toArray();
            
        if (empty($userSkillIds)) return 15;

        $requiredSkillIds = DB::table('card_skill')->distinct()->pluck('skill_id')->toArray();
        if (empty($requiredSkillIds)) return 95;

        $matches = array_intersect($userSkillIds, $requiredSkillIds);
        $rate = (count($matches) / count($requiredSkillIds)) * 100;

        return min(100, round($rate));
    }

    private function processSkillDecay()
    {
        $expiredSkills = DB::table('user_skill')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->get();

        foreach ($expiredSkills as $skill) {
            if ($skill->proficiency_level > 1) {
                $newLevel = $skill->proficiency_level - 1;
                $newExpiresAt = $newLevel == 1 ? Carbon::now()->addDays(30) : Carbon::now()->addDays(15);

                DB::table('user_skill')
                    ->where('user_id', $skill->user_id)
                    ->where('skill_id', $skill->skill_id)
                    ->update([
                        'proficiency_level' => $newLevel,
                        'tasks_completed' => 0, 
                        'expires_at' => $newExpiresAt
                    ]);
            } else {
                DB::table('user_skill')
                    ->where('user_id', $skill->user_id)
                    ->where('skill_id', $skill->skill_id)
                    ->delete();
            }
        }
    }
}
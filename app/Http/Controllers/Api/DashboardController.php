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
        // 💀 SESSİZ PASLANMA MOTORUNU ÇALIŞTIR (Kullanıcı dashboard'a girdiğinde temizlik başlar)
        $this->processSkillDecay();

        $user = request()->user();

        // 1. GLOBAL SYNERGY: Tüm takımdaki görevlerin yeteneklerle uyumu
        $globalSynergy = $this->calculateGlobalSynergy();
        
        // 2. SKILL MATCH RATE: Giriş yapan kullanıcının AKTİF yeteneklerinin mevcut görevlere uyumu
        $userMatchRate = $this->calculateUserSkillMatchRate($user);
        
        // 3. SKILL BALANCE: Kullanıcının AKTİF yeteneklerinin sistemdeki toplam çeşitliliğe oranı
        $totalSystemSkills = Skill::count() ?: 1;
        
        // 🌟 GÜNCELLENDİ: Sadece süresi geçmemiş (aktif) yetenekleri say
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

        return response()->json([
            'skill_match_rate' => (int)$userMatchRate,
            'avg_complexity' => round(Card::avg('complexity_level'), 1) ?: 5.0,
            'bottleneck_alerts' => Card::where('complexity_level', '>=', 8)->where('is_completed', false)->count(),
            'global_synergy' => (int)$globalSynergy,
            'skill_balance' => $balanceDisplay,
            'efficiency_data' => $chartData,
            
            'tasks' => Card::with(['users', 'requiredSkills', 'badges'])->latest()->take(3)->get(),
            'active_sprints_list' => Sprint::where('status', 'active')->with('tasks')->latest()->take(3)->get(),
            'active_sprints' => Sprint::where('status', 'active')->count(),
            'dbTalent' => User::all(['id', 'name', 'email', 'avatar']),
            'notifications' => $user->notifications()->latest()->take(10)->get(),
            
            'search_workspaces' => Workspace::latest()->take(20)->get(['id', 'name', 'slug']),
            'search_tasks'      => Card::with('requiredSkills')->latest()->take(50)->get(),
            'search_users'      => User::latest()->take(50)->get(['id', 'name', 'email', 'avatar']),
            'search_sprints'    => Sprint::latest()->take(20)->get(['id', 'name', 'status']),
        ]);
    }

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

    /**
     * 💀 SESSİZ PASLANMA MOTORU (Decay Engine)
     * Kullanıcının süresi dolmuş yeteneklerini kontrol eder ve RPG mantığıyla düşürür.
     */
    private function processSkillDecay()
    {
        // Süresi dolmuş olan (expires_at tarihi geçmiş) yetenekleri bul
        $expiredSkills = DB::table('user_skill')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now())
            ->get();

        foreach ($expiredSkills as $skill) {
            if ($skill->proficiency_level > 1) {
                // Eğer level 1'den büyükse: 1 level düş, görev sayacını sıfırla
                $newLevel = $skill->proficiency_level - 1;
                
                // Eğer 1. levele düştüyse ona son bir şans olarak 30 gün ver, yoksa standart 15 gün bekleme süresi ver
                $newExpiresAt = $newLevel == 1 ? Carbon::now()->addDays(30) : Carbon::now()->addDays(15);

                DB::table('user_skill')
                    ->where('user_id', $skill->user_id)
                    ->where('skill_id', $skill->skill_id)
                    ->update([
                        'proficiency_level' => $newLevel,
                        'tasks_completed' => 0, // XP Sıfırlandı
                        'expires_at' => $newExpiresAt
                    ]);
            } else {
                // Eğer zaten Level 1 ise ve süresi dolmuşsa yetenek tamamen paslanıp kaybolur
                DB::table('user_skill')
                    ->where('user_id', $skill->user_id)
                    ->where('skill_id', $skill->skill_id)
                    ->delete();
            }
        }
    }
}
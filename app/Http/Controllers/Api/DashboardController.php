<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\Workspace; 
use App\Models\User;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. GLOBAL SYNERGY HESAPLAMASI (Tüm Takım)
        $globalSynergy = $this->calculateGlobalSynergy();
        
        // 🌟 2. KULLANICIYA ÖZEL SKILL MATCH RATE (Dinamik)
        $userMatchRate = $this->calculateUserSkillMatchRate();
        
        // 3. DİNAMİK GRAFİK VERİSİ
        $chartData = $this->getEfficiencyData();

        // 4. SKILL BALANCE HESAPLAMA
        $requiredSkillIds = DB::table('card_skill')->distinct()->pluck('skill_id');
        $possessedSkillIds = DB::table('user_skill')->distinct()->pluck('skill_id');
        $matchedCount = $requiredSkillIds->intersect($possessedSkillIds)->count();
        $totalRequired = $requiredSkillIds->count();
        $balanceScore = $totalRequired > 0 ? round(($matchedCount / $totalRequired) * 10) : 10;
        $user = request()->user();
        $userSkillsCount = DB::table('user_skill')->where('user_id', $user->id)->count();

        // Sadece bu kullanıcıya atanmış, bitmemiş görevlerin ortalama zorluğu
        $averageTaskComplexity = \App\Models\Card::whereHas('users', function($q) use ($user) {
            $q->where('users.id', $user->id);
        })->where('is_completed', false)->avg('complexity_level') ?? 5;
        $dynamicMatchRate = min(100, round(($userSkillsCount / $averageTaskComplexity) * 50));

        $notifications = $user->notifications()
        ->latest()
        ->take(10)
        ->get();

        return response()->json([
            'skill_match_rate' => $dynamicMatchRate, // 🎯 ARTIK DİNAMİK!
            'avg_complexity' => round(Card::avg('complexity_level'), 1) ?? 0,
            'bottleneck_alerts' => Card::where('complexity_level', '>=', 8)->count(),
            'global_synergy' => $globalSynergy,
            'skill_balance' => $balanceScore . "/10",
            'efficiency_data' => $chartData,
            
            'tasks' => \App\Models\Card::with('users')->latest()->take(3)->get(),
            
            'search_tasks' => Card::with('requiredSkills')->latest()->take(50)->get(),
            'search_workspaces' => Workspace::latest()->take(20)->get(['id', 'name', 'slug']),

            'active_sprints_list' => Sprint::where('status', 'active')->with('tasks')->latest()->take(3)->get(),
            'active_sprints' => Sprint::where('status', 'active')->count(),
            'dbTalent' => \App\Models\User::all(['id', 'name', 'email', 'avatar']),
            'notifications' => $notifications
        ]);
    }
    /**
     * Veritabanındaki görevleri aylara göre gruplar ve saatleri toplar.
     */
    private function getEfficiencyData()
    {
        $cards = Card::whereNotNull('created_at')->get();

        if ($cards->isEmpty()) {
            return [];
        }

        $groupedData = $cards->groupBy(function($card) {
            return \Carbon\Carbon::parse($card->created_at)->format('n'); 
        })->sortKeys();

        return $groupedData->map(function ($monthCards, $monthNum) {
            $monthName = \Carbon\Carbon::create()->month($monthNum)->format('M');
            
            $estimatedTotal = $monthCards->sum('estimated_hours') ?? 0;
            $actualTotal = $monthCards->sum('actual_hours') ?? 0;

            if ($actualTotal == 0 && $estimatedTotal > 0) {
                $actualTotal = round($estimatedTotal * 0.85);
            }

            return [
                'month' => $monthName,
                'estimated' => (int)$estimatedTotal,
                'actual' => (int)$actualTotal
            ];
        })->values()->toArray();
    }

    /**
     * Tüm aktif görevler ve atanan kullanıcılar arasındaki
     * yetenek eşleşme skorlarının genel ortalamasını alır.
     */
    private function calculateGlobalSynergy()
    {
        $assignedCards = Card::has('users')->with('users', 'requiredSkills')->get();
        
        if ($assignedCards->isEmpty()) {
            return 0;
        }

        $totalScore = 0;
        $matchCount = 0;

        foreach ($assignedCards as $card) {
            foreach ($card->users as $user) {
                $score = $this->calculateMatchScore($user, $card);
                $totalScore += $score;
                $matchCount++;
            }
        }

        return $matchCount > 0 ? round($totalScore / $matchCount) : 0;
    }

    /**
     * 🌟 YENİ: Giriş yapan kullanıcıya özel yetenek eşleşme oranını hesaplar.
     */
    private function calculateUserSkillMatchRate()
    {
        $user = request()->user();

        if (!$user) {
            return 0; 
        }

        // Sadece bu kullanıcıya atanmış görevleri buluyoruz
        $userCards = Card::whereHas('users', function($q) use ($user) {
            $q->where('users.id', $user->id);
        })->get();

        // Eğer kullanıcının henüz kendine atanmış hiçbir görevi yoksa, 
        // takımın genel sinerjisini (global synergy) gösteriyoruz ki ekranda 0 yazmasın.
        if ($userCards->isEmpty()) {
            return $this->calculateGlobalSynergy();
        }

        $totalScore = 0;
        foreach ($userCards as $card) {
            $totalScore += $this->calculateMatchScore($user, $card);
        }

        // Kullanıcının ortalamasını döndür
        return round($totalScore / $userCards->count());
    }

    /**
     * AI Eşleşme Fonksiyonu
     */
    private function calculateMatchScore($user, $card)
    {
        $taskComplexity = $card->complexity_level ?? 5;
        
        // NOT: Şu an kullanıcının yetenek seviyesi 7 olarak sabit bırakıldı.
        // İlerleyen aşamalarda kullanıcının sahip olduğu yetenek sayısına göre bağlayabiliriz:
        // $userSkillLevel = DB::table('user_skill')->where('user_id', $user->id)->count();
        $userSkillLevel = 7; 

        $difference = abs($taskComplexity - $userSkillLevel);
        $matchPercentage = max(0, 100 - ($difference * 10));

        return $matchPercentage;
    }
}
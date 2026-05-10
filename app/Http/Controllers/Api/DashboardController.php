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
        $user = request()->user();

        // 1. GLOBAL SYNERGY: Tüm takımdaki görevlerin yeteneklerle uyumu
        $globalSynergy = $this->calculateGlobalSynergy();
        
        // 2. SKILL MATCH RATE: Giriş yapan kullanıcının yeteneklerinin mevcut görevlere (ID bazlı) uyumu
        $userMatchRate = $this->calculateUserSkillMatchRate($user);
        
        // 3. SKILL BALANCE: Kullanıcının yeteneklerinin sistemdeki toplam çeşitliliğe oranı
        $totalSystemSkills = Skill::count() ?: 1;
        $userUniqueSkillsCount = DB::table('user_skill')->where('user_id', $user->id)->distinct('skill_id')->count();
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
        // Gerçek görevlerin aylarını al ve grafik için saat üret
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
        // Sistemdeki her atama için: Görevin istediği yeteneklerden kaçı kullanıcıda var?
        $assignedCards = Card::has('users')->with('requiredSkills', 'users')->get();
        if ($assignedCards->isEmpty()) return 85; // Kimse atanmamışsa %85 default ver

        $totalRate = 0;
        $totalAssignments = 0;

        foreach ($assignedCards as $card) {
            $requiredIds = $card->requiredSkills->pluck('id')->toArray();
            if (empty($requiredIds)) continue;

            foreach ($card->users as $u) {
                $userSkillIds = DB::table('user_skill')->where('user_id', $u->id)->pluck('skill_id')->toArray();
                $matches = array_intersect($userSkillIds, $requiredIds);
                $totalRate += (count($matches) / count($requiredIds)) * 100;
                $totalAssignments++;
            }
        }

        return $totalAssignments > 0 ? round($totalRate / $totalAssignments) : 85;
    }

    private function calculateUserSkillMatchRate($user)
    {
        // 1. Kullanıcının sahip olduğu yetenek ID'lerini al
        $userSkillIds = DB::table('user_skill')->where('user_id', $user->id)->pluck('skill_id')->toArray();
        if (empty($userSkillIds)) return 15; // Hiç yeteneği yoksa %15 başlasın

        // 2. Sistemde yetenek bekleyen tüm benzersiz yetenek ID'lerini al
        $requiredSkillIds = DB::table('card_skill')->distinct()->pluck('skill_id')->toArray();
        if (empty($requiredSkillIds)) return 95; // Görevler yetenek istemiyorsa uyum tamdır

        // 3. Kesişime bak: Sende olan yetenekler, sistemin istediklerinin ne kadarı?
        $matches = array_intersect($userSkillIds, $requiredSkillIds);
        $rate = (count($matches) / count($requiredSkillIds)) * 100;

        return min(100, round($rate));
    }
}
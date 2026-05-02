<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use App\Models\User;
use App\Models\Sprint;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function index()
    {
        // =====================================================================
        // 1. ÜST STAT KARTLARI (Gerçek Veri Agregasyonları)
        // =====================================================================
        $totalHours = Card::sum('estimated_hours') ?? 0;
        
        try {
            // Projedeki benzersiz yetenek gereksinimleri
            $skillCount = DB::table('card_skill')->distinct('skill_id')->count() ?? 0;
        } catch (\Exception $e) {
            $skillCount = 0; // Pivot tablo yoksa veya boşsa 0 döndür
        }
        
        $avgComplexity = round(Card::avg('complexity_level'), 1) ?? 0;
        $activeUsers = User::count();

        $stats = [
            ['title' => 'Total Capacity', 'value' => $totalHours . 'h'],
            ['title' => 'Skill Density', 'value' => $skillCount],
            ['title' => 'Avg. Task Complexity', 'value' => $avgComplexity],
            ['title' => 'Resource Allocation', 'value' => $activeUsers . ' Users']
        ];

        // =====================================================================
        // 2. ACTIVE BOARDS (Gerçek Sprint ve Görev Ortalamaları)
        // =====================================================================
        $activeBoards = Sprint::whereIn('status', ['active', 'planned'])
            ->latest()
            ->get()
            ->map(function($sprint) {
                // Bu sprinte ait görevlerin ortalama zorluğunu al (Görev yoksa 0)
                $avgSprintComplexity = round($sprint->tasks()->avg('complexity_level')) ?: 0;
                
                // Dinamik AI Match Skoru: Sprint zorluğu ortalama bir seviyeye (ör: 7) 
                // ne kadar yakınsa eşleşme o kadar yüksektir. (Gerçek veriden türetilir)
                $matchScore = max(0, 100 - (abs($avgSprintComplexity - 7) * 10));

                return [
                    'name' => $sprint->name,
                    'match' => $matchScore,
                    'complexity' => $avgSprintComplexity
                ];
            });

        // =====================================================================
        // 3. AUTHORS TABLE (Kullanıcıların Gerçek İş Yükü ve Verileri)
        // =====================================================================
        $authors = User::take(6)
            ->get()
            ->map(function($user) {
                // 1. Gerçek İş Yükü (Kullanıcının atandığı görevlerin toplam saatleri)
                try {
                    $workload = DB::table('cards')
                        ->join('card_user', 'cards.id', '=', 'card_user.card_id')
                        ->where('card_user.user_id', $user->id)
                        ->sum('estimated_hours') ?? 0;
                } catch (\Exception $e) {
                    $workload = 0;
                }

                // 2. Gerçek Yetenek (Kullanıcının veritabanındaki ilk yeteneği)
                try {
                    $topSkillId = DB::table('user_skill')->where('user_id', $user->id)->value('skill_id');
                    // Eğer skills tablonuz varsa adını çekiyoruz, yoksa varsayılan metin.
                    $topSkillName = $topSkillId ? DB::table('skills')->where('id', $topSkillId)->value('name') : 'Developer';
                } catch (\Exception $e) {
                    $topSkillName = 'Developer';
                }

                return [
                    'name' => $user->name,
                    'skill' => $topSkillName ?? 'Developer',
                    'workload' => $workload . 'h estimated'
                ];
            })
            // En çok iş yükü olan yazılımcıyı listenin en üstüne çıkarır
            ->sortByDesc(function($author) {
                return (int) str_replace('h estimated', '', $author['workload']);
            })
            ->values();

        // =====================================================================
        // 4. EKRANA GÖNDERİM
        // =====================================================================
        return Inertia::render('Workspaces/Index', [
            'dbStats' => $stats,
            'dbBoards' => $activeBoards,
            'dbAuthors' => $authors
        ]);
    }
}
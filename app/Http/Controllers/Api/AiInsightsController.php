<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AiInsightsController extends Controller
{
    public function index()
    {
        // 1. Talent Optimization Matrix Verileri (Gerçek Algoritmik Veriler)
        $dbTalent = User::with('skills')->take(8)->get()->map(function($user) {
            
            // --- A. GENEL PERFORMANS İNDEKSİ ---
            $completedTasks = DB::table('cards')
                ->join('card_user', 'cards.id', '=', 'card_user.card_id')
                ->where('card_user.user_id', $user->id)
                ->where('cards.is_completed', true)
                ->get();

            $performance = $completedTasks->count() > 0 
                ? min(100, $completedTasks->avg('complexity_level') * 10 + 20) 
                : 30; // Görev yoksa taban puan

            // --- B. GERÇEK GELİŞİM (GROWTH) HESAPLAMASI ---
            $now = Carbon::now();
            $thirtyDaysAgo = clone $now->subDays(30);
            $sixtyDaysAgo = clone $now->subDays(60);

            // Son 30 günde tamamlanan görevlerin toplam zorluk (efor) puanı
            $recentScore = DB::table('cards')
                ->join('card_user', 'cards.id', '=', 'card_user.card_id')
                ->where('card_user.user_id', $user->id)
                ->where('cards.is_completed', true)
                ->where('cards.updated_at', '>=', $thirtyDaysAgo)
                ->sum('complexity_level');

            // Önceki 30 günde (31-60 gün arası) tamamlanan görevlerin toplam efor puanı
            $pastScore = DB::table('cards')
                ->join('card_user', 'cards.id', '=', 'card_user.card_id')
                ->where('card_user.user_id', $user->id)
                ->where('cards.is_completed', true)
                ->whereBetween('cards.updated_at', [$sixtyDaysAgo, $thirtyDaysAgo])
                ->sum('complexity_level');

            // Büyüme Oranını (Yüzdesini) Hesapla
            if ($pastScore > 0) {
                // Matematiksel büyüme formülü: ((Yeni - Eski) / Eski) * 100
                $growthValue = (($recentScore - $pastScore) / $pastScore) * 100;
            } else {
                // Eskiden hiç görev yapmamış ama yeni görev yapmışsa baz puan ver
                $growthValue = $recentScore > 0 ? 15 : 0; 
            }

            // Değeri yuvarla ve UI için formatla (Örn: "+12%" veya "-5%")
            $growthValue = round($growthValue);
            $growthDisplay = ($growthValue > 0 ? '+' : '') . $growthValue . '%';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,  
                'skills' => $user->skills->pluck('name')->take(2)->toArray() ?: ['Generalist'],
                'performance' => round($performance),
                'growth' => $growthDisplay, // Artık veritabanından dinamik geliyor!
                'growth_raw' => $growthValue // React tarafında yeşil/kırmızı renk vermek için
            ];
        });

        // 2. Project Insights (Görev Analizi)
        $dbProjects = Card::where('is_completed', false)
            ->latest()
            ->take(6)
            ->get()
            ->map(function($card) {
                // Başarı Güveni Türetme: Zorluk arttıkça güven düşer
                $confidence = max(10, 100 - ($card->complexity_level * 8));
                
                // Atama Nedeni Belirleme
                $reasons = ['High Skill Match', 'Deadline Critical', 'Load Balanced'];
                $reason = $reasons[$card->id % 3];

                return [
                    'name' => $card->title,
                    'complexity' => $card->complexity_level,
                    'reason' => $reason,
                    'confidence' => $confidence
                ];
            });

        return Inertia::render('AiInsights', [
            'dbTalent' => $dbTalent,
            'dbProjects' => $dbProjects
        ]);
    }
}
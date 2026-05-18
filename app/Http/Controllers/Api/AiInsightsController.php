<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Card;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AiInsightsController extends Controller
{
    /**
     * AI Insights Ana Sayfa Verileri
     */
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
                $growthValue = (($recentScore - $pastScore) / $pastScore) * 100;
            } else {
                $growthValue = $recentScore > 0 ? 15 : 0; 
            }

            // Değeri yuvarla ve UI için formatla
            $growthValue = round($growthValue);
            $growthDisplay = ($growthValue > 0 ? '+' : '') . $growthValue . '%';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,  
                'skills' => $user->skills->pluck('name')->take(2)->toArray() ?: ['Generalist'],
                'performance' => round($performance),
                'growth' => $growthDisplay,
                'growth_raw' => $growthValue
            ];
        });

        // 🌟 2. Project Insights (Gerçekçi ve Akıllı Görev Analizi)
        $dbProjects = Card::with(['users.skills', 'users.badges', 'requiredSkills', 'sprint'])
            ->where('is_completed', false)
            ->whereHas('sprint', function ($q) {
                $q->whereIn('status', ['active', 'planned']);
            })
            ->latest()
            ->take(6)
            ->get()
            ->map(function($card) {
                
                // --- 1. Eşleşme Skoru (Confidence) Hesaplama ---
                $reqSkills = $card->requiredSkills->pluck('name')->map(fn($s) => strtolower($s))->toArray();
                $assignedUsers = $card->users;

                if ($assignedUsers->isEmpty()) {
                    // Görev kimseye atanmamışsa güven skoru düşük olur (Örn: 20 ile 40 arası)
                    $confidence = max(15, 50 - ($card->complexity_level * 5));
                    $reason = 'Unassigned Risk';
                } else if (empty($reqSkills)) {
                    // Görev atanmış ama özel bir yetenek gerektirmiyorsa, zorluğa göre ortalama bir güven ver
                    $confidence = max(50, 90 - ($card->complexity_level * 4));
                    $reason = 'General Task';
                } else {
                    // Görev atanmış ve yetenek gerektiriyorsa GERÇEK EŞLEŞMEYİ hesapla
                    $totalMatchRate = 0;
                    foreach ($assignedUsers as $user) {
                        $userKeywords = array_merge(
                            $user->skills->pluck('name')->map(fn($s) => strtolower($s))->toArray(),
                            $user->badges->pluck('name')->map(fn($b) => strtolower($b))->toArray()
                        );
                        
                        $intersect = array_intersect($userKeywords, $reqSkills);
                        $totalMatchRate += (count($intersect) / count($reqSkills)) * 100;
                    }
                    
                    // Atanan kişilerin ortalama eşleşme yüzdesi
                    $avgMatchRate = $totalMatchRate / $assignedUsers->count();
                    
                    // Zorluk çarpanı ekle (Görev kolaysa güven biraz daha artar, zorsa azalır)
                    $difficultyModifier = (5 - $card->complexity_level) * 2; 
                    
                    $confidence = min(99, max(10, round($avgMatchRate + $difficultyModifier)));
                    
                    if ($confidence >= 80) $reason = 'High Synergy';
                    elseif ($confidence >= 50) $reason = 'Skill Balanced';
                    else $reason = 'Skill Gap Detected';
                }

                // Ekrana yansıt
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

    /**
     * 🧠 Yapay Zeka Öneri Motoru Entegrasyonu
     */
    public function getRecommendations(Request $request)
    {
        $request->validate([
            'task_description' => 'required|string|min:5'
        ]);

        $taskDescription = $request->input('task_description');

        // 1. YAPAY ZEKAYA GİDERKEN: Hem Yetenekleri Hem Rozetleri birleştirip yolla!
        $users = User::with(['skills', 'badges'])->get()->map(function ($user) {
            $userSkills = $user->skills->pluck('name')->toArray();
            $userBadges = $user->badges->pluck('name')->toArray();
            return [
                'id' => $user->id,
                'name' => $user->name,
                // AI'nin ikisini de taraması için birleştiriyoruz
                'skills' => array_merge($userSkills, $userBadges) ?: ['Generalist'] 
            ];
        });

        try {
            $response = Http::timeout(5)->post('http://127.0.0.1:5000/api/recommend-user', [
                'task_description' => $taskDescription,
                'users' => $users->toArray()
            ]);

            if ($response->successful()) {
                $aiData = $response->json();

                // 2. YAPAY ZEKADAN DÖNERKEN: UI için Skills ve Badges'i tekrar ayır
                $userIds = collect($aiData['recommendations'])->pluck('user_id');
                $usersDb = User::with(['skills', 'badges'])->whereIn('id', $userIds)->get()->keyBy('id');

                foreach ($aiData['recommendations'] as &$rec) {
                    $user = $usersDb->get($rec['user_id']);
                    
                    if ($user) {
                        $actualSkills = $user->skills->pluck('name')->toArray();
                        $actualBadges = $user->badges->pluck('name')->toArray();

                        // Eğer ikisi de boşsa Rookie rozetini bas
                        if (empty($actualSkills) && empty($actualBadges)) {
                            $rec['matched_skills'] = [];
                            $rec['badges'] = ['🛡️ Rookie', '🌱 Fast Learner'];
                        } else {
                            // Değilse gerçek verileri ata
                            $rec['matched_skills'] = $actualSkills; 
                            $rec['badges'] = $actualBadges; 
                        }
                    }
                }

                return response()->json($aiData);
            }
            return response()->json(['error' => 'FastAPI server is not responding.'], 502);
        } catch (\Exception $e) {
            return response()->json(['error' => 'AI Server Down.', 'details' => $e->getMessage()], 500);
        }
    }
}
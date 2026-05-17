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

    /**
     * 🧠 Yapay Zeka Öneri Motoru Entegrasyonu
     * Seçilen görevin açıklamasını ve ekip üyelerinin yeteneklerini Python (FastAPI) mikroservisine gönderir.
     */
    public function getRecommendations(Request $request)
    {
        // 1. Gelen isteğin doğrulamasını yap (Görev açıklaması zorunlu)
        $request->validate([
            'task_description' => 'required|string|min:5'
        ]);

        $taskDescription = $request->input('task_description');

        // 2. Sistemdeki tüm kullanıcıları ve yeteneklerini (Skill) çek ve Python formatına uyarla
        $users = User::with('skills')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'skills' => $user->skills->pluck('name')->toArray() ?: ['Generalist']
            ];
        });

        // 3. Redis/HTTP Yapısı: Python FastAPI Mikroservisine Güvenli İstek At (Port 5000)
        try {
            $response = Http::timeout(5)->post('http://127.0.0.1:5000/api/recommend-user', [
                'task_description' => $taskDescription,
                'users' => $users->toArray()
            ]);

            // Eğer Python motoru başarılı cevap döndüyse veriyi doğrudan React'e postala
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json(['error' => 'Yapay Zeka motoru (FastAPI) şu an yanıt vermiyor.'], 502);

        } catch (\Exception $e) {
            // Eğer Python servisi başlatılmadıysa veya çöktüyse yakala
            return response()->json([
                'error' => 'AI Mikroservisi kapalı veya bağlantı reddedildi. Lütfen sunucuda uvicorn servisinin açık olduğundan emin olun.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
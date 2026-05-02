<?php



namespace App\Http\Controllers\Api;



use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;

use App\Models\Badge;

use Carbon\Carbon;



class TalentMatrixController extends Controller

{

    public function index()

    {
        /** @var \App\Models\User $user */
        $user = Auth::user();



        // 1. Competency Breakdown (Yetenek Kırılımı)

        // Kullanıcının aktif rozetlerini al ve kategorilerine göre grupla

        $activeBadges = $user->active_badges;

        

        $competencies = [];

        $idCounter = 1;



        // Kategorileri güzel isimlere çevir

        $categoryNames = [

            'frontend' => 'Frontend Development',

            'backend' => 'Backend Development',

            'devops' => 'DevOps & Infrastructure',

            'general' => 'General Competencies'

        ];



        // Rozetleri kategoriye göre gruplayıp Competency dizisini oluştur

        $groupedBadges = $activeBadges->groupBy('category');

        

        foreach ($groupedBadges as $categoryKey => $badgesInCat) {

            // O kategorideki tüm rozet isimlerini virgülle birleştir (Örn: "React, Vue")

            $skillNames = $badgesInCat->pluck('name')->implode(', ');

            

            // O rozetlerle ilgili toplam yapılan görev sayısını (taslak olarak) hesapla

            // Gerçek senaryoda bu, $user->cards()->whereHas('badges', ...) ile hesaplanabilir

            $totalTasks = $badgesInCat->count() * rand(3, 8); 



            $competencies[] = [

                'id' => $idCounter++,

                'category' => $categoryNames[$categoryKey] ?? 'Other Skills',

                'skill' => $skillNames,

                'tasks' => $totalTasks

            ];

        }





        // 2. Learning Path & Evolution (Öğrenme Yolu ve Zaman Tüneli)

        // Kullanıcının TÜM rozet geçmişini al (süresi dolanlar dahil)

        $allBadgeHistory = $user->badges()

            ->withPivot('last_earned_at', 'expires_at')

            ->orderByPivot('last_earned_at', 'desc')

            ->get();



        $learningPathNewest = [];

        $learningPathYesterday = [];

        

        $now = Carbon::now();

        $yesterdayEnd = clone $now->subDays(1)->endOfDay();



        foreach ($allBadgeHistory as $badge) {

            $lastEarned = Carbon::parse($badge->pivot->last_earned_at);

            $expiresAt = Carbon::parse($badge->pivot->expires_at);

            

            $status = 'Girdi';

            $type = 'in';

            $timeText = $lastEarned->format('j F Y, \a\t H:i A');



            // Eğer rozetin süresi dolmuşsa

            if ($expiresAt->isPast()) {

                $status = 'Çıktı';

                $type = 'out';

                $timeText = 'Expired ' . $expiresAt->diffForHumans();

            } 

            // Eğer süresinin dolmasına 7 günden az kalmışsa uyarı ver

            elseif ($expiresAt->diffInDays($now) <= 7) {

                $status = 'Bildiri';

                $type = 'warn';

                $timeText = "Last Activity " . $lastEarned->diffForHumans() . "\nIt will expire in " . $expiresAt->diffInDays($now) . " days.";

            }



            $item = [

                'id' => $badge->id . '-' . rand(100,999), // Benzersiz ID

                'skill' => $badge->name,

                'time' => $timeText,

                'status' => $status,

                'type' => $type

            ];



            // Öğeyi tarihe göre (Bugün olanlar vs Eskiler) ayır

            if ($lastEarned->greaterThan($yesterdayEnd)) {

                $learningPathNewest[] = $item;

            } else {

                $learningPathYesterday[] = $item;

            }

        }



        // Eğer Yeni sekmesi boş kalırsa, UI kırılmasın diye varsayılan bir yazı atalım

        if (empty($learningPathNewest)) {

             $learningPathNewest[] = [

                'id' => 9999,

                'skill' => 'System AI',

                'time' => 'Waiting for new activity...',

                'status' => 'Standby',

                'type' => 'warn'

            ];

        }





        return Inertia::render('TalentMatrix', [

            'talentScore' => $user->talent_score, 
            
            'dbCompetencies' => $competencies,
            'dbLearningPathNewest' => $learningPathNewest,
            'dbLearningPathYesterday' => $learningPathYesterday,
            'topBadge' => $activeBadges->first() 

        ]);

    }

}
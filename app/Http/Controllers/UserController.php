<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Tüm kullanıcıları AiInsights tablosu için listeler
     */
    public function index()
    {
        // 🌟 GÜNCELLEME: Performansı hesaplayabilmek için 'tasks' ilişkisini de çekiyoruz
        $users = User::with(['badges', 'tasks'])->get()->map(function($user) {
            
            // 🧠 GERÇEK PERFORMANS ALGORİTMASI 
            $totalTasks = $user->tasks->count();
            $completedTasks = $user->tasks->where('is_completed', true)->count();
            
            // Eğer görevi varsa (Tamamlanan / Toplam) * 100 yap. Hiç görevi yoksa varsayılan 70 ver.
            $realPerformance = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 70;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // 🔥 Artık rand() yok, emekle kazanılmış gerçek performans yüzdesi var!
                'performance' => $user->performance ?? $realPerformance, 
                'growth' => ($user->growth ?? '+2') . ' Skill Gain',
                'growth_raw' => $user->growth ?? 2,
                'skills' => $user->badges->pluck('name')->take(3),
            ];
        });

        return Inertia::render('AiInsights', [
            'dbTalent' => $users
        ]);
    }

    /**
     * Tıklanan kullanıcının gerçek verilerini profil sayfasına basar
     */
    public function show($id)
    {
        $user = User::with(['badges', 'tasks' => function($query) {
            $query->orderBy('updated_at', 'desc');
        }])->findOrFail($id);

        // 🧠 GERÇEK PERFORMANS ALGORİTMASI (Profil Sayfası İçin Birebir Aynı Mantık)
        $totalTasks = $user->tasks->count();
        $completedTasks = $user->tasks->where('is_completed', true)->count();
        $realPerformance = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 70;

        $userProfile = [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'avatar'          => $user->avatar, 
            'developer_title' => $user->developer_title, 
            'talentScore'     => $user->talent_score,
            
            // 🔥 Burada da rand() tuzağını kaldırdık!
            'performance'     => $user->performance ?? $realPerformance,
            'growth'          => $user->growth ?? '+2',
            
            'badges'          => $user->badges->map(fn($b) => [
                'name' => $b->name,
                'icon' => $b->icon,
            ]),

            'activeSprints'   => $user->tasks->where('status', 'in_progress')->map(fn($t) => [
                'title' => $t->name ?? $t->title, 
                'deadline' => $t->due_date ? $t->due_date->format('d M Y') : 'No Deadline'
            ])->values(),

            'recentActivities' => $user->tasks->where('status', 'completed')->take(5)->map(fn($t) => [
                'action' => 'Task Completed',
                'date' => $t->updated_at->diffForHumans(), 
                'description' => "'" . ($t->name ?? $t->title) . "' task successfully completed."
            ])->values()
        ];

        return Inertia::render('Profile/Show', [
            'userProfile' => $userProfile
        ]);
    }
}
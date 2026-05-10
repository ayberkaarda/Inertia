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
        $users = User::with(['badges', 'tasks'])->get()->map(function($user) {
            
            // 🧠 GERÇEK PERFORMANS ALGORİTMASI 
            $totalTasks = $user->tasks->count();
            $completedTasks = $user->tasks->where('is_completed', true)->count();
            
            $realPerformance = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 70;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
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
        // 🌟 1. DÜZELTME: 'skills' ilişkisini de çekiyoruz
        $user = User::with(['badges', 'skills', 'tasks' => function($query) {
            $query->orderBy('created_at', 'desc')->take(10);
        }])->findOrFail($id);

        // 🧠 GERÇEK PERFORMANS ALGORİTMASI
        $totalTasks = $user->tasks->count();
        $completedTasks = $user->tasks->where('is_completed', true)->count();
        $realPerformance = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 70;

        // 🌟 2. DÜZELTME: Sadece süresi dolmamış skilleri çekiyoruz
        $activeSkills = $user->skills()->where(function($q) {
            $q->whereNull('user_skill.expires_at')
              ->orWhere('user_skill.expires_at', '>', now());
        })->get();

        // 🌟 3. DÜZELTME: 'status' yerine 'is_completed' kullanıyoruz ve formata sokuyoruz
        $recentActivities = $user->tasks->take(5)->map(function($task) {
            return [
                'action' => $task->is_completed ? 'Mission Completed' : 'Mission Active',
                'date' => $task->created_at->diffForHumans(),
                'description' => "Working on: " . ($task->title ?? $task->name) . " (" . $task->complexity_level . "★ Complexity)"
            ];
        })->toArray();

        // Eğer hiç görevi yoksa varsayılan mesaj
        if (empty($recentActivities)) {
            $recentActivities = [[
                'action' => 'System Initialized',
                'date' => $user->created_at->diffForHumans(),
                'description' => 'Profile created and neural link established.'
            ]];
        }

        $userProfile = [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'avatar'          => $user->avatar, 
            'developer_title' => $user->developer_title, 
            'talentScore'     => $user->talent_score,
            'performance'     => $user->performance ?? $realPerformance,
            'growth'          => $user->growth ?? '+2',
            
            'badges'          => $user->badges->map(fn($b) => [
                'name' => $b->name,
                'icon' => $b->icon,
            ]),
            
            // 🔥 4. DÜZELTME: React tarafının beklediği eksik "skills" değişkenini gönderiyoruz!
            'skills'          => $activeSkills,
            
            // 🔥 5. DÜZELTME: Düzenlenmiş görev listesini gönderiyoruz
            'recentActivities'=> $recentActivities
        ];

        return Inertia::render('Profile/Show', [
            'userProfile' => $userProfile
        ]);
    }
}
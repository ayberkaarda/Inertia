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
        // User modelindeki accessor'lar (talent_score, developer_title) 
        // $appends içinde olduğu için burada otomatik olarak yüklenecek.
        $users = User::with(['badges'])->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'performance' => $user->performance ?? rand(60, 95),
                'growth' => ($user->growth ?? '+2') . ' Skill Gain',
                'growth_raw' => $user->growth ?? 2,
                // Yetenekler kısmında kullanıcının sahip olduğu rozet isimlerini gösteriyoruz
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
        // Kullanıcıyı, rozetlerini ve görevlerini (Card/Task) tek seferde çekiyoruz
        $user = User::with(['badges', 'tasks' => function($query) {
            $query->orderBy('updated_at', 'desc');
        }])->findOrFail($id);

        // React tarafındaki Profile/Show sayfasına gidecek gerçek veri paketi
        $userProfile = [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'avatar'          => $user->avatar, // Veritabanındaki avatar yolunu gönderiyoruz
            // Modelindeki accessor'ları (Dinamik Unvan ve Talent Score) doğrudan kullanıyoruz
            'developer_title' => $user->developer_title, 
            'talentScore'     => $user->talent_score,
            'performance'     => $user->performance ?? 85,
            'growth'          => $user->growth ?? '+2',
            
            // Kullanıcının sahip olduğu tüm rozetler (badgets/ klasöründeki ikonlarla)
            'badges'          => $user->badges->map(fn($b) => [
                'name' => $b->name,
                'icon' => $b->icon,
            ]),

            // Şu an uğraştığı aktif görevler (Sprint içindeki aktif kartlar)
            'activeSprints'   => $user->tasks->where('status', 'in_progress')->map(fn($t) => [
                'title' => $t->name ?? $t->title, // Card modelindeki sütun adına göre
                'deadline' => $t->due_date ? $t->due_date->format('d M Y') : 'No Deadline'
            ])->values(),

            // Son tamamlanan aktiviteler (Timeline için)
            'recentActivities' => $user->tasks->where('status', 'completed')->take(5)->map(fn($t) => [
                'action' => 'Task Completed',
                'date' => $t->updated_at->diffForHumans(), // "2 hours ago" gibi gerçek zaman
                'description' => "'{$t->name}' task successfully completed." // Gerçek görev adıyla
            ])->values()
        ];

        return Inertia::render('Profile/Show', [
            'userProfile' => $userProfile
        ]);
    }
}
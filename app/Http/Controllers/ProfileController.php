<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User; // User modelini dahil ettik

class ProfileController extends Controller
{
    /**
     * 🌟 YENİ EKLENDİ: Display the user's public profile (Show.jsx).
     */
    public function show($id)
    {
        // 1. Kullanıcıyı bul ve GEREKLİ TÜM İLİŞKİLERİ yükle
        $user = User::with([
            'badges', 
            'skills', 
            'tasks' => function($query) { 
                $query->orderBy('created_at', 'desc')
                      ->take(5); // Son 5 görevi al (Timeline için)
            }
        ])->findOrFail($id);

        // 2. Sağ taraftaki "Activity Timeline" için görevleri formata sok
        $recentActivities = $user->tasks->map(function($task) {
            return [
                'action' => 'Assigned to Mission',
                'date' => $task->created_at->diffForHumans(),
                'description' => "Working on: " . $task->title . " (" . $task->complexity_level . "★ Complexity)"
            ];
        })->toArray();

        // Eğer görev yoksa, varsayılan bir başlangıç mesajı atalım
        if (empty($recentActivities)) {
            $recentActivities = [[
                'action' => 'Account Created',
                'date' => $user->created_at->diffForHumans(),
                'description' => 'Joined the system and initialized neural link.'
            ]];
        }

        // 3. Veriyi Frontend'e (React'e) gönder
        return Inertia::render('Profile/Show', [
            'userProfile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'developer_title' => $user->developer_title,
                'talentScore' => $user->talent_score,
                'performance' => 85, // İstersen dinamik yapabilirsin
                'skills' => $user->active_skills, // Sadece süresi dolmamışları yollar
                'badges' => $user->active_badges, // Sadece süresi dolmamışları yollar
                'recentActivities' => $recentActivities, 
            ]
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's avatar image.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');

            $user->avatar = $path;
            $user->save();

            return response()->json([
                'message' => 'avatar successfully updated!',
                'avatar_url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'not found.'], 400);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
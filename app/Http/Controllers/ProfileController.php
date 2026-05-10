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
        $user = User::with([
        'skills', 
        'badges', 
        'tasks' => function($query) {
            $query->where('is_completed', false)->latest()->take(5);
        }
    ])->findOrFail($id);

    // Sağdaki Timeline için görevleri hazırlıyoruz
    $recentActivities = $user->tasks->map(function($task) {
        return [
            'action' => 'Mission In Progress',
            'date' => $task->created_at->diffForHumans(),
            'description' => "Currently working on: " . $task->title . " (" . $task->complexity_level . "★)"
        ];
    })->toArray();

    if (empty($recentActivities)) {
        $recentActivities = [[
            'action' => 'System Initialized',
            'date' => $user->created_at->diffForHumans(),
            'description' => 'Profile created and neural link established.'
        ]];
    }

    return Inertia::render('Profile/Show', [
        'userProfile' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'developer_title' => $user->developer_title,
            'talentScore' => $user->talent_score,
            'performance' => 92, 
            'skills' => $user->active_skills, // 🌟 Süresi dolmamış skiller gider
            'badges' => $user->active_badges,
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
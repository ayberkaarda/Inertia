<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Badge;
use App\Models\Skill;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class UserManagementController extends Controller
{
    public function index()
    {
        Gate::authorize('manage-users');

        $users = User::with(['badges', 'skills'])->get();
        $allBadges = Badge::all();
        $allSkills = Skill::all();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'allBadges' => $allBadges,
            'allSkills' => $allSkills
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:user,admin,observer',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return back()->with('message', 'User created successfully! 🚀');
    }

    public function storeBadge(Request $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:frontend,backend,devops,general',
            'icon' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048',
        ]);

        $path = $request->file('icon')->store('badges', 'public');

        Badge::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'icon' => $path,
        ]);

        return back()->with('message', 'Badge created successfully! 🏆');
    }

    public function storeSkill(Request $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name',
        ]);

        Skill::create([
            'name' => $validated['name']
        ]);

        return back()->with('message', 'Skill created successfully! 🎯');
    }

    public function destroySkill(Skill $skill)
    {
        Gate::authorize('manage-users');
        $skill->delete();
        return back()->with('message', 'Skill deleted successfully.');
    }

    public function destroy(User $user)
    {
        Gate::authorize('manage-users');

        if ($user->email === 'inertia@test.com') {
            return redirect()->back()->with('error', 'System Override: owner role cannot be deleted!');
        }

        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself!');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully.');
    }

    public function destroyBadge(Badge $badge)
    {
        Gate::authorize('manage-users');

        if ($badge->icon && Storage::disk('public')->exists($badge->icon)) {
            Storage::disk('public')->delete($badge->icon);
        }

        $badge->delete();

        return back()->with('message', 'Badge deleted successfully.');
    }

    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('manage-users');
        
        $request->validate(['role' => 'required|in:admin,user,observer']);

        if ($user->email === 'inertia@test.com' && $request->role !== 'admin') {
            return redirect()->back()->with('error', 'System Override: owner role cannot be changed!');
        }

        $user->update(['role' => $request->role]);

        return redirect()->back()->with('message', 'User role updated successfully.');
    }

    public function syncBadges(Request $request, User $user)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'badge_ids' => 'array',
            'badge_ids.*' => 'exists:badges,id'
        ]);

        $syncData = [];
        if ($request->has('badge_ids')) {
            foreach ($request->badge_ids as $id) {
                $syncData[$id] = [
                    'last_earned_at' => now(), 
                    'expires_at' => now()->addDays(60)
                ];
            }
        }

        $user->badges()->sync($syncData);

        return redirect()->back()->with('message', 'User badges updated successfully.');
    }

    public function syncSkills(Request $request, User $user)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'skills' => 'array',
            'skills.*.id' => 'required|exists:skills,id',
            'skills.*.level' => 'required|integer|min:1|max:10',
        ]);

        $syncData = [];
        if ($request->has('skills')) {
            foreach ($request->skills as $skillData) {
                $syncData[$skillData['id']] = [
                    'proficiency_level' => $skillData['level'],
                    'tasks_completed' => 0,
                    'expires_at' => now()->addDays(30)
                ];
            }
        }

        $user->skills()->sync($syncData);

        return redirect()->back()->with('message', 'User skills updated successfully.');
    }
}
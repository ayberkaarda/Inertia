<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Badge;
use Illuminate\Support\Facades\Gate;

class UserManagementController extends Controller
{
    public function index()
    {
        // 🔒 Bu sayfayı sadece Admin görebilir
        Gate::authorize('manage-users');

        $users = User::with('badges')->get();
        $allBadges = Badge::all();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'allBadges' => $allBadges
        ]);
    }
    // KULLANICI SİLME (Admin Yetkisi)
    public function destroy(User $user)
    {
        Gate::authorize('manage-users');

        // Adminin yanlışlıkla kendini silmesini engelleyelim
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself!');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully.');
    }

    // Kullanıcı Rolünü Güncelle (Admin yapar/Kullanıcı yapar)
    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('manage-users');
        
        $request->validate(['role' => 'required|in:admin,user']);
        $user->update(['role' => $request->role]);

        return redirect()->back()->with('message', 'User role updated successfully.');
    }

    // Kullanıcıya Rozet Ekle/Çıkar (Manuel Müdahale)
    public function syncBadges(Request $request, User $user)
    {
        Gate::authorize('manage-users');

        $request->validate([
            'badge_ids' => 'array',
            'badge_ids.*' => 'exists:badges,id'
        ]);

        // Gelen rozet ID'lerini döngüye alıp 60 günlük süreleriyle birlikte senkronize et
        $syncData = [];
        if ($request->has('badge_ids')) {
            foreach ($request->badge_ids as $id) {
                $syncData[$id] = ['last_earned_at' => now(), 'expires_at' => now()->addDays(60)];
            }
        }

        $user->badges()->sync($syncData);

        return redirect()->back()->with('message', 'User badges updated successfully.');
    }
}
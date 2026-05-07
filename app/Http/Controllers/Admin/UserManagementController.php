<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Badge;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

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

    // 👤 KULLANICI OLUŞTURMA (Admin Paneli)
    public function store(Request $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:user,admin',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return back()->with('message', 'User created successfully! 🚀');
    }

    // 🏆 ROZET OLUŞTURMA (Kategori ve İkon Kaydı)
    public function storeBadge(Request $request)
    {
        Gate::authorize('manage-users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:frontend,backend,devops,general',
            'icon' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048',
        ]);

        // İkonu storage/app/public/badges klasörüne kaydet
        $path = $request->file('icon')->store('badges', 'public');

        Badge::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'icon' => $path,
        ]);

        return back()->with('message', 'Badge created successfully! 🏆');
    }

    // 🌟 KULLANICI SİLME (GÜÇLENDİRİLMİŞ KALKAN)
    public function destroy(User $user)
    {
        Gate::authorize('manage-users');

        // 1. ROOT KALKANI: inertia@test.com ASLA silinemez!
        if ($user->email === 'inertia@test.com') {
            return redirect()->back()->with('error', 'System Override: owner role cannot be deleted!');
        }

        // 2. KENDİNİ KORUMA: Admin yanlışlıkla kendini silemez!
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself!');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully.');
    }

    public function destroyBadge(Badge $badge)
{
    Gate::authorize('manage-users');

    // Sunucudan ikon dosyasını silelim (Baştaki \ işaretini kaldırdık)
    if ($badge->icon && Storage::disk('public')->exists($badge->icon)) {
        Storage::disk('public')->delete($badge->icon);
    }

    $badge->delete();

    return back()->with('message', 'Badge deleted successfully.');
}

    // 🌟 KULLANICI ROLÜNÜ GÜNCELLE (GÜÇLENDİRİLMİŞ KALKAN)
    public function updateRole(Request $request, User $user)
    {
        Gate::authorize('manage-users');
        
        $request->validate(['role' => 'required|in:admin,user']);

        // ROOT KALKANI: inertia@test.com hesabının yetkisi ASLA düşürülemez!
        if ($user->email === 'inertia@test.com' && $request->role !== 'admin') {
            return redirect()->back()->with('error', 'System Override: owner role cannot be changed!');
        }

        $user->update(['role' => $request->role]);

        return redirect()->back()->with('message', 'User role updated successfully.');
    }

    // Kullanıcıya Rozet Ekle/Çıkar
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
                // expires_at alanını 60 gün sonrasına kuruyoruz
                $syncData[$id] = [
                    'last_earned_at' => now(), 
                    'expires_at' => now()->addDays(60)
                ];
            }
        }

        $user->badges()->sync($syncData);

        return redirect()->back()->with('message', 'User badges updated successfully.');
    }
}
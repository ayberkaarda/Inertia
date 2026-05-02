<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage; // EKLENDİ: Eski fotoğrafları silmek için
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
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
     * EKLENDİ: Update the user's avatar image.
     */
    public function updateAvatar(Request $request)
    {
        // 1. Güvenlik: Gelen dosya gerçekten bir resim mi ve boyutu uygun mu? (Maks 2MB)
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // 2. Varsa eski fotoğrafı sunucudan sil (Sunucu dolmasın diye)
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // 3. Yeni resmi 'avatars' klasörüne kaydet
            $path = $request->file('avatar')->store('avatars', 'public');

            // 4. Resmin yolunu veritabanına yaz
            $user->avatar = $path;
            $user->save();

            // Başarılı yanıtı ve yeni resmin URL'sini React'e dön
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
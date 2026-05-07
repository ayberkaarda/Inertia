<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Tek bir bildirimi okundu olarak işaretle.
     */
    public function markAsRead($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user) {
            // Kendi custom modelimiz üzerinden bildirimi bul
            $notification = $user->notifications()->findOrFail($id);
            
            // Okundu işaretini 'read_at' sütununa şu anki zamanı (now) yazarak yapıyoruz
            $notification->update(['read_at' => now()]);
        }

        return back();
    }

    /**
     * Tüm okunmamış bildirimleri okundu olarak işaretle.
     */
    public function markAllAsRead()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user) {
            // Sadece okunmamış olanları (read_at IS NULL) bul ve hepsinin saatini şu an yap
            $user->notifications()->whereNull('read_at')->update(['read_at' => now()]);
        }

        return back();
    }
}
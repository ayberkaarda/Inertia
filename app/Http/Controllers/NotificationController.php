<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
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
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();
    }

    return back();
    }

    /**
     * Tüm okunmamış bildirimleri okundu olarak işaretle.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        if ($user) {
            $user->unreadNotifications->markAsRead();
        }

        return back();
    }
}
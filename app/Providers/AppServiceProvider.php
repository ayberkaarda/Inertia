<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword; // 🎯 EKLENDİ
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Card;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // 1. Sprint Oluşturma İzni (Sadece Admin)
        Gate::define('create-sprint', function (User $user) {
            return $user->isAdmin();
        });

        // 2. Başka Kullanıcıyı Göreve Atama İzni (Sadece Admin)
        Gate::define('assign-tasks', function (User $user) {
            return $user->isAdmin();
        });

        // 3. Yetkileri ve Rozetleri Yönetme Sayfası İzni (Sadece Admin)
        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        // 4. Görev (Task) Oluşturma İzni (Herkes)
        Gate::define('create-task', function (User $user) {
            return true; 
        });
        // 5. Görevi Düzenleme İzni (Sadece Admin VEYA Görevi Oluşturan Kişi)
        Gate::define('edit-task', function (User $user, Card $card) {
            return $user->isAdmin() || $user->id === $card->user_id;
        });

        // 6. Görevi Silme İzni (Sadece Admin VEYA Görevi Oluşturan Kişi)
        Gate::define('delete-task', function (User $user, Card $card) {
            return $user->isAdmin() || $user->id === $card->user_id;
        });

        // 🌟 YENİ: Görevi Tamamlama İzni (Herkes) 🌟
        Gate::define('complete-task', function (User $user) {
            return true; // Herkes herhangi bir görevi tamamlayabilir
        });
		ResetPassword::toMailUsing(function ($notifiable, $token) {
            return (new MailMessage)
                ->subject('Password Reset Request')
                ->greeting('Hello!')
                ->line('We received a password reset request for your account.')
                ->action('Reset Password', url(route('password.reset', [
                    'token' => $token,
                    'email' => $notifiable->getEmailForPasswordReset(),
                ], false)))
                ->line('This password reset link will expire in 60 minutes.')
                ->line('If you did not request a password reset or did it by mistake, no further action is required.')
                ->salutation('Best regards, ' . config('app.name'));
        });
    }
}
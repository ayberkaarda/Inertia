<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Card;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // 1. Sprint Oluşturma İzni (Sadece Admin)
        // Not: Observer görebilir ama oluşturamaz, o yüzden burası admin kalabilir.
        Gate::define('create-sprint', function (User $user) {
            return $user->isAdmin();
        });

        // 2. Başka Kullanıcıyı Göreve Atama İzni (Sadece Admin)
        Gate::define('assign-tasks', function (User $user) {
            return $user->isAdmin();
        });

        // 3. Yetkileri ve Rozetleri Yönetme Sayfası İzni (Admin VEYA Observer)
        // 🌟 DEĞİŞTİRİLDİ: Observer bu sayfaya GİREBİLMELİ ama Middleware sayesinde işlem yapamayacak.
        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin() || $user->role === 'observer';
        });

        // 4. Görev (Task) Oluşturma İzni (Admin veya User - Observer hariç)
        // 🌟 DEĞİŞTİRİLDİ: Observer'ın görev oluşturmasını engellemek için kısıtladık.
        Gate::define('create-task', function (User $user) {
            return $user->role !== 'observer'; 
        });

        // 5. Görevi Düzenleme İzni (Sadece Admin VEYA Görevi Oluşturan Kişi)
        Gate::define('edit-task', function (User $user, Card $card) {
            return ($user->isAdmin() || $user->id === $card->user_id) && $user->role !== 'observer';
        });

        // 6. Görevi Silme İzni (Sadece Admin VEYA Görevi Oluşturan Kişi)
        Gate::define('delete-task', function (User $user, Card $card) {
            return ($user->isAdmin() || $user->id === $card->user_id) && $user->role !== 'observer';
        });

        // 7. Görevi Tamamlama İzni (Observer Hariç Herkes)
        Gate::define('complete-task', function (User $user) {
            return $user->role !== 'observer'; 
        });

        // Şifre Sıfırlama Mail Yapılandırması
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
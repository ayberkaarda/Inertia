<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\AiInsightsController; 
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\TalentMatrixController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Api\BadgeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 🌍 HERKESE AÇIK ALAN (Public)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 🔒 GÜVENLİ ALAN (Sadece Giriş Yapanlar)
Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD & İSTATİSTİKLER ---
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/dashboard-stats', [DashboardController::class, 'index']);
    Route::get('/api/dashboard', [DashboardController::class, 'index'])->name('api.dashboard');

    // --- WORKSPACES ---
    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');

    // 🤖 AI INSIGHTS ---
    Route::get('/ai-insights', [AiInsightsController::class, 'index'])->name('ai.index');

    Route::get('/talent-matrix', [TalentMatrixController::class, 'index'])->name('talent-matrix.index');

    // web.php içinde
Route::get('/user-profile/{id}', [UserController::class, 'show'])->name('user.profile');


    // --- SPRINT & TASK İŞLEMLERİ ---
    Route::get('/sprints', [SprintController::class, 'index'])->name('sprints.index');
    Route::post('/sprints', [SprintController::class, 'store']);
    Route::put('/sprints/{sprint}', [SprintController::class, 'update']);
    Route::delete('/sprints/{sprint}', [SprintController::class, 'destroy']);
    Route::put('/sprints/{sprint}/status', [SprintController::class, 'updateStatus']);
    
    // Tasks
    Route::post('/sprints/{sprint}/tasks', [SprintController::class, 'storeTask']);
    Route::put('/tasks/{card}', [SprintController::class, 'updateTask']);
    Route::delete('/tasks/{card}', [SprintController::class, 'destroyTask']);
    Route::post('/tasks/{card}/join', [SprintController::class, 'joinTask'])->name('tasks.join');
    Route::patch('/tasks/{card}/toggle-completion', [SprintController::class, 'toggleTaskCompletion']);

    // --- PROFİL İŞLEMLERİ ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/user/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');

    // --- ADMİN PANELİ İŞLEMLERİ ---
    Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
    Route::put('/admin/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('admin.users.role');
    Route::post('/admin/users/{user}/badges', [UserManagementController::class, 'syncBadges'])->name('admin.users.badges');
    Route::delete('/admin/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/admin/badges', [BadgeController::class, 'store'])->name('admin.badges.store');
    Route::post('/admin/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::delete('/admin/badges/{badge}', [UserManagementController::class, 'destroyBadge'])->name('admin.badges.destroy');
    
    // Admin Görev Atama Rotası (Sprint Controller içinde)
    Route::post('/tasks/{card}/assign', [SprintController::class, 'assignUserToTask'])->name('tasks.assign');

}); // <-- BURADAKİ NOKTALI VİRGÜL HAYAT KURTARIR!

require __DIR__.'/auth.php';
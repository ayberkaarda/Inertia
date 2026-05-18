<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\AiInsightsController; 
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\TalentMatrixController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 🌍 PUBLIC
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 🔒 AUTH REQUIRED
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/dashboard-stats', [DashboardController::class, 'index']);
    Route::get('/api/dashboard', [DashboardController::class, 'index'])->name('api.dashboard');
    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('workspaces.index');
    Route::get('/ai-insights', [AiInsightsController::class, 'index'])->name('ai.index');
    Route::get('/talent-matrix', [TalentMatrixController::class, 'index'])->name('talent-matrix.index');
    Route::get('/user-profile/{id}', [UserController::class, 'show'])->name('user.profile');

    // SPRINT & TASKS
    Route::get('/sprints', [SprintController::class, 'index'])->name('sprints.index');
    Route::post('/sprints', [SprintController::class, 'store']);
    Route::put('/sprints/{sprint}', [SprintController::class, 'update']);
    Route::delete('/sprints/{sprint}', [SprintController::class, 'destroy']);
    Route::put('/sprints/{sprint}/status', [SprintController::class, 'updateStatus']);
    Route::post('/sprints/{sprint}/tasks', [SprintController::class, 'storeTask']);
    Route::put('/tasks/{card}', [SprintController::class, 'updateTask']);
    Route::delete('/tasks/{card}', [SprintController::class, 'destroyTask']);
    Route::post('/tasks/{card}/join', [SprintController::class, 'joinTask'])->name('tasks.join');
    Route::patch('/tasks/{card}/toggle-completion', [SprintController::class, 'toggleTaskCompletion']);
    Route::post('/tasks/{card}/assign', [SprintController::class, 'assignUserToTask'])->name('tasks.assign');

    // PROFILE
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/user/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');

    // 🛠️ ADMIN PANEL (TÜM YOLLAR USERMANAGEMENT'A ÇIKAR)
    Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
    Route::post('/admin/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/admin/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
    
    // Skill Management
    Route::post('/admin/skills', [UserManagementController::class, 'storeSkill'])->name('admin.skills.store');
    Route::delete('/admin/skills/{skill}', [UserManagementController::class, 'destroySkill'])->name('admin.skills.destroy');
    Route::post('/admin/users/{user}/skills', [UserManagementController::class, 'syncSkills'])->name('admin.users.skills');

    // Badge Management (Artık UserManagementController İçindeki Metotlar Kullanılıyor)
    Route::post('/admin/badges', [UserManagementController::class, 'storeBadge'])->name('admin.badges.store');
    Route::delete('/admin/badges/{badge}', [UserManagementController::class, 'destroyBadge'])->name('admin.badges.destroy');
    Route::post('/admin/users/{user}/badges', [UserManagementController::class, 'syncBadges'])->name('admin.users.badges');

    // NOTIFICATIONS & CHAT
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::get('/inbox', [ChatController::class, 'index'])->name('chat.inbox');
    Route::get('/chat/{receiver}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/message', [ChatController::class, 'store'])->name('chat.store');
    Route::post('/chat/{conversation}/read', [\App\Http\Controllers\ChatController::class, 'markAsRead']);

    Route::post('/api/ai/recommendations', [\App\Http\Controllers\Api\AiInsightsController::class, 'getRecommendations'])->name('ai.recommendations');

    // DROPBOXXX
    // DROPBOX ROUTES
    Route::get('/dropbox', [\App\Http\Controllers\DropboxController::class, 'index'])->name('dropbox.index');
    Route::post('/dropbox/{sprint}', [\App\Http\Controllers\DropboxController::class, 'store'])->name('dropbox.store');
    Route::delete('/dropbox/file/{file}', [\App\Http\Controllers\DropboxController::class, 'destroy'])->name('dropbox.destroy');

});

require __DIR__.'/auth.php';
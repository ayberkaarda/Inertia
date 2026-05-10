<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Card;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];
    protected $appends = ['developer_title', 'talent_score'];

    public function ownedWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function boards(): BelongsToMany
    {
        return $this->belongsToMany(Board::class)
                    ->withPivot('role');
    }

    // 🌟 GÜNCELLENDİ: expires_at pivot tablosuna eklendi
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'user_skill')
                    ->withPivot(['proficiency_level', 'expires_at']);
    }

    // 🌟 YENİ: Sadece süresi dolmamış (aktif) yetenekleri getiren özellik
    public function getActiveSkillsAttribute()
    {
        return $this->skills()->where(function($q) {
            $q->whereNull('user_skill.expires_at')
              ->orWhere('user_skill.expires_at', '>', now());
        })->get();
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
                    ->withPivot(['last_earned_at', 'expires_at'])
                    ->withTimestamps();
    }
    
    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Card::class, 'card_user');
    }

    public function cards(): BelongsToMany
    {
        return $this->belongsToMany(Card::class, 'card_user');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class)->orderBy('created_at', 'desc');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    public function getActiveBadgesAttribute()
    {
        return $this->badges()->wherePivot('expires_at', '>', now())->get();
    }

    public function getDeveloperTitleAttribute()
    {
        $badges = $this->active_badges;
        $count = $badges->count();

        if ($count == 0) {
            return 'Rookie (No Active Badges)';
        }

        $hasFrontend = $badges->where('category', 'frontend')->count() > 0;
        $hasBackend = $badges->where('category', 'backend')->count() > 0;

        $levelrole = 'Developer';
        if ($hasFrontend && $hasBackend) {
            $levelrole = 'Software Developer'; 
        } elseif ($hasFrontend) {
            $levelrole = 'Frontend Developer';
        } elseif ($hasBackend) {
            $levelrole = 'Backend Developer';
        }

        $level = '';
        if ($count <= 2) {
            $level = 'Junior ';
        } elseif ($count <= 5) {
            $level = 'Mid-Level '; 
        } else {
            $level = 'Senior '; 
        }

        return $level . $levelrole; 
    }

    public function getTalentScoreAttribute()
    {
        $activeBadgesCount = $this->active_badges->count();
        $totalBadgesCount = $this->badges()->count(); 
        $expiredBadgesCount = $totalBadgesCount - $activeBadgesCount;

        if ($totalBadgesCount == 0) {
            return "1.0";
        }

        $score = 2.0 + ($activeBadgesCount * 1.5) + ($expiredBadgesCount * 0.3);

        if ($score > 9.9) {
            $score = 9.9;
        }

        return number_format($score, 1);
    }

    public function getAverageSkillLevelAttribute()
    {
        return $this->skills()->avg('proficiency_level') ?: 0;
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
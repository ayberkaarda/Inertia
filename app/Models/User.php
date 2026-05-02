<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'user_skill')
                    ->withPivot('proficiency_level');
    }
    // Kullanıcının Rozetleri İlişkisi
    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
                    ->withPivot(['last_earned_at', 'expires_at'])
                    ->withTimestamps();
    }
    // Kullanıcının atanmış olduğu tüm kartlar (görevler)
    public function tasks(): BelongsToMany
    {
    // Kart modelinin adının 'Card' olduğunu ve 'user_id' sütunuyla bağlı olduğunu varsayıyorum.
    return $this->belongsToMany(Card::class, 'card_user');
    }
    // KULLANICI YETKİ KONTROLLERİ
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    // 🔥 Aktif Rozetleri Getir (Süresi 60 günü geçmemiş olanlar)
    public function getActiveBadgesAttribute()
    {
        return $this->badges()->wherePivot('expires_at', '>', now())->get();
    }

    // 🧠 DİNAMİK UNVAN ÜRETİCİ (AI Mantığı)
    public function getDeveloperTitleAttribute()
    {
        $badges = $this->active_badges;
        $count = $badges->count();

        // Eğer hiç aktif rozeti yoksa
        if ($count == 0) {
            return 'Rookie (No Active Badges)';
        }

        // Backend ve Frontend rozetlerini say
        $hasFrontend = $badges->where('category', 'frontend')->count() > 0;
        $hasBackend = $badges->where('category', 'backend')->count() > 0;

        // Alanı (Role) Belirle
        $levelrole = 'Developer';
        if ($hasFrontend && $hasBackend) {
            $levelrole = 'Fullstack Developer';
        } elseif ($hasFrontend) {
            $levelrole = 'Frontend Developer';
        } elseif ($hasBackend) {
            $levelrole = 'Backend Developer';
        }

        // Seviyeyi (Level) Belirle
        $level = '';
        if ($count <= 2) {
            $level = 'Junior ';
        } elseif ($count <= 5) {
            $level = 'Mid-Level '; // 3-5 rozet arası Mid
        } else {
            $level = 'Senior '; // 6 ve üzeri rozeti varsa Senior!
        }

        return $level . $levelrole; // Örn: "Junior Frontend Developer" veya "Senior Fullstack Developer"
    }
    // 🧠 DİNAMİK YETENEK PUANI HESAPLAYICI (Talent Score)
    public function getTalentScoreAttribute()
    {
        // 1. Kullanıcının tüm rozet geçmişini ve aktif rozetlerini sayalım
        $activeBadgesCount = $this->active_badges->count();
        $totalBadgesCount = $this->badges()->count(); 
        $expiredBadgesCount = $totalBadgesCount - $activeBadgesCount;

        // 2. Eğer hiç rozeti yoksa sisteme yeni girmiştir, başlangıç puanı ver.
        if ($totalBadgesCount == 0) {
            return "1.0";
        }

        // 3. Puanlama Algoritması:
        // - Taban puan: 2.0
        // - Her AKTİF rozet: +1.5 puan (Güncel bilgiyi ödüllendir)
        // - Her SÜRESİ DOLMUŞ rozet: +0.3 puan (Geçmiş tecrübeyi tamamen silme)
        $score = 2.0 + ($activeBadgesCount * 1.5) + ($expiredBadgesCount * 0.3);

        // 4. Puanın 9.9'u geçmesini engelle (Tavan limit)
        if ($score > 9.9) {
            $score = 9.9;
        }

        // 5. Küsuratları düzelt (Örn: 7.354 yerine 7.3 dönsün)
        return number_format($score, 1);
    }

    // Kullanıcının toplam yetkinlik puanını hesaplayan bir accessor
    public function getAverageSkillLevelAttribute()
    {
        return $this->skills()->avg('proficiency_level') ?: 0;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

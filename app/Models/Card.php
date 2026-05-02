<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Card extends Model
{
    protected $fillable = [
        'list_id', 'title', 'description', 
        'position', 'complexity_level', 'estimated_hours','actual_hours', 'version', 'sprint_id', 'is_completed'
    ];

    protected $casts = [
        'due_date' => 'date',
        'is_completed' => 'boolean'
    ];

    // Kartın ait olduğu liste
    public function boardList(): BelongsTo
    {
        return $this->belongsTo(BoardList::class, 'list_id');
    }

    // İŞTE EKSİK OLAN VE YENİ EKLEDİĞİMİZ KISIM BURASI:
    // Bu karta atanan kullanıcıları getirir (Many-to-Many)
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    // Kartın tamamlanması için gereken yetenekler
    public function requiredSkills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'card_skill')
                    ->withPivot('min_required_level');
    }
    public function sprint() {
    return $this->belongsTo(Sprint::class);
}
    public function badges()
    {
    return $this->belongsToMany(Badge::class);
    }

    /**
     * Akıllı Eşleştirme (Smart Matching)
     * Bu karta atanan kullanıcının uyum skorunu hesaplar.
     */
    public function calculateMatchScore(User $user)
    {
        $required = $this->requiredSkills;
        $userSkills = $user->skills->pluck('pivot.proficiency_level', 'id');
        
        if ($required->isEmpty()) return 100;

        $totalMatch = 0;
        foreach ($required as $skill) {
            $userLevel = $userSkills[$skill->id] ?? 0;
            // Kullanıcı seviyesi / Gereken seviye oranı (max 1 olacak şekilde)
            $totalMatch += min(1, $userLevel / $skill->pivot->min_required_level);
        }

        return round(($totalMatch / $required->count()) * 100, 2);
    }
}
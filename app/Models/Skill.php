<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    protected $fillable = ['name', 'category']; // category: 'hard' veya 'soft'

    // Bu yeteneğe sahip olan kullanıcılar
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_skill')
                    ->withPivot('proficiency_level') // 1-10 arası seviye
                    ->withTimestamps();
    }

    // Bu yeteneği gerektiren kartlar (görevler)
    public function cards(): BelongsToMany
    {
        return $this->belongsToMany(Card::class, 'card_skill')
                    ->withPivot('min_required_level')
                    ->withTimestamps();
    }
}

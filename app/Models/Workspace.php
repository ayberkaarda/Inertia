<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'owner_id',
    ];

    public function boards(): HasMany
    {
        return $this->hasMany(Board::class);
    }
}

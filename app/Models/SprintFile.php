<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SprintFile extends Model
{
    protected $guarded = [];

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
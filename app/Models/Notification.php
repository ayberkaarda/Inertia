<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    /**
     * Toplu atama yapılabilecek alanlar.
     * Bu sayede Notification::create([...]) kullanabilirsin.
     */
    protected $fillable = [
        'user_id',
        'type',
        'message',
        'read_at',
    ];

    /**
     * Tarih olarak işlenecek alanlar.
     * Bu sayede $notification->read_at->diffForHumans() gibi Carbon metodlarını kullanabilirsin.
     */
    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Bildirimin ait olduğu kullanıcı.
     * Relationship: Her bildirim bir kullanıcıya aittir.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
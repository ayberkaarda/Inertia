<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['conversation_id', 'sender_id', 'body', 'is_read'];

    // Mesajlar Inertia (React) tarafına giderken tarih formatı siberpunk/okunabilir olsun
    protected $appends = ['time'];

    public function getTimeAttribute() {
        return $this->created_at->format('H:i');
    }

    public function conversation() {
        return $this->belongsTo(Conversation::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
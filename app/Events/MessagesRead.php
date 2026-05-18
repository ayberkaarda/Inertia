<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagesRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $userId; // Mesajları o an okuyan (odaya giren) kişinin ID'si

    public function __construct($conversationId, $userId)
    {
        $this->conversationId = $conversationId;
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        // React tarafındaki window.Echo.private(`chat.${conversation.id}`) kanalına yayın yapıyoruz
        return [
            new PrivateChannel('chat.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        // React tarafındaki .listen('.MessagesRead') yakalayıcısı için takma isim
        return 'MessagesRead';
    }
}
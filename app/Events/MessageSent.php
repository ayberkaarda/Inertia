<?php
namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // ⚡ Anında gitsin diye Now kullanıyoruz
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        // Mesajı React'ın ihtiyaç duyduğu sender bilgisiyle yüklüyoruz (Beyaz ekran olmasın diye 😉)
        $this->message = $message->load('sender'); 
    }

    // Mesaj hangi odaya (Kanala) gidecek?
    public function broadcastOn(): array
    {
        // Sadece bu konuşmaya ait özel (Private) odaya yayın yap
        return [
            new PrivateChannel('chat.' . $this->message->conversation_id),
        ];
    }
}
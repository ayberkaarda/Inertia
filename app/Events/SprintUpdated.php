<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // DİKKAT: Now kullanıyoruz
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SprintUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        // Gerekirse buraya veri eklenebilir ama biz sadece tetikleme yapacağız
    }

    public function broadcastOn(): array
    {
        // 'sprints' adında genel bir yayın kanalı açıyoruz
        return [
            new Channel('sprints'),
        ];
    }
}
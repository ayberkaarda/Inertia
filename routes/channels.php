<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::routes(['middleware' => ['web', 'auth']]);

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    // Sadece bu konuşmanın içindeki iki kişiden biriyse kanala girmesine izin ver
    return $user->id === $conversation->user_one_id || $user->id === $conversation->user_two_id;
});
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

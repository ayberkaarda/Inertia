<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

// 🌟 BU SATIR HAYAT KURTARIR! Web oturumunu (session) Reverb'e bağlar.
Broadcast::routes(['middleware' => ['web']]);

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    return $user && ($user->id === $conversation->user_one_id || $user->id === $conversation->user_two_id);
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return $user && (int) $user->id === (int) $id;
});
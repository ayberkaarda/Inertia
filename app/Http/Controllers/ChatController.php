<?php
namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification; 
use App\Events\MessageSent;
use App\Events\NewNotification; 
use App\Events\MessagesRead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ChatController extends Controller
{
    // 🌟 INBOX SAYFASI
    public function index()
    {
        $userId = Auth::id();
        
        $conversations = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne', 'userTwo', 'messages' => function($query) {
                $query->latest()->limit(1); 
            }])
            ->get()
            ->map(function ($conv) use ($userId) {
                $otherUser = $conv->user_one_id === $userId ? $conv->userTwo : $conv->userOne;
                $lastMessage = $conv->messages->first();
                
                return [
                    'id' => $conv->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar' => $otherUser->avatar, 
                    ],
                    'last_message' => $lastMessage ? $lastMessage->body : 'No messages yet...',
                    // Uygulama timezone'u ayarlandığı için sadece diffForHumans yeterli
                    'time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '', 
                ];
            });

        return Inertia::render('Chat/Inbox', [
            'conversations' => $conversations
        ]);
    }

    // 🌟 SOHBET ODASI
    public function show(User $receiver)
    {
        $userId = Auth::id();

        $conversation = Conversation::where(function ($query) use ($userId, $receiver) {
            $query->where('user_one_id', $userId)->where('user_two_id', $receiver->id);
        })->orWhere(function ($query) use ($userId, $receiver) {
            $query->where('user_one_id', $receiver->id)->where('user_two_id', $userId);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one_id' => $userId,
                'user_two_id' => $receiver->id,
            ]);
        }

        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', $receiver->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        broadcast(new MessagesRead($conversation->id, $userId))->toOthers();

        // 🌟 Eski mesajları çekerken sadece H:i formatında alıyoruz. 
        // config/app.php 'Europe/Istanbul' olduğu için otomatik Türkiye saati gelecek.
        $messages = $conversation->messages()->with('sender')->get()->map(function($msg) {
            $msg->time = $msg->created_at->format('H:i');
            return $msg;
        });

        return Inertia::render('Chat/Room', [
            'conversation' => $conversation,
            'messages' => $messages,
            'receiver' => $receiver,
            'currentUser' => Auth::user(),
        ]);
    }

    // 🌟 MANUEL GÖRÜLDÜ TETİKLEYİCİ
    public function markAsRead(Conversation $conversation)
    {
        $userId = Auth::id();
        
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        broadcast(new MessagesRead($conversation->id, $userId))->toOthers();

        return response()->json(['success' => true]);
    }

    // 🌟 MESAJ GÖNDERME
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate(['body' => 'required|string']);

        $userId = Auth::id();

        $message = $conversation->messages()->create([
            'sender_id' => $userId,
            'body' => $request->body,
            'read_at' => null, 
        ]);

        $message->load('sender');
        $message->read_at = null;

        // Config'ten dolayı direkt Türkiye saati olarak formatlanır
        $messageTime = $message->created_at->format('H:i');
        $message->time = $messageTime;

        broadcast(new MessageSent($message))->toOthers();

        $receiverId = $conversation->user_one_id === $userId ? $conversation->user_two_id : $conversation->user_one_id;
        $notificationData = json_encode([
            'text' => Auth::user()->name . " sent you an encrypted message.",
            'link' => '/chat/' . $userId 
        ]);

        $notification = Notification::create([
            'user_id' => $receiverId,
            'type' => 'message',
            'message' => $notificationData 
        ]);

        broadcast(new NewNotification($notification))->toOthers();

        return response()->json([
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'body' => $message->body,
            'read_at' => null, 
            'time' => $messageTime,
            'created_at' => $message->created_at->toISOString(),
            'sender' => $message->sender
        ]); 
    }
}
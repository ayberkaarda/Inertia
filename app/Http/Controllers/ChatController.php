<?php
namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification; 
use App\Events\MessageSent;
use App\Events\NewNotification; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    // 🌟 INBOX SAYFASI: Tüm konuşmaları listele
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

        $messages = $conversation->messages()->with('sender')->get();

        return Inertia::render('Chat/Room', [
            'conversation' => $conversation,
            'messages' => $messages,
            'receiver' => $receiver,
            'currentUser' => Auth::user(),
        ]);
    }

    // 🌟 MESAJI FIRLAT VE BİLDİRİME LİNK GİZLE
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate(['body' => 'required|string']);

        $userId = Auth::id();

        // 1. Mesajı veritabanına kaydet
        $message = $conversation->messages()->create([
            'sender_id' => $userId,
            'body' => $request->body,
        ]);

        $message->load('sender');

        // 2. REVERB İLE MESAJI KARŞI TARAFA FIRLAT
        broadcast(new MessageSent($message))->toOthers();

        // 🌟 3. YENİ: BİLDİRİME IŞINLANMA KOORDİNATI (LİNK) EKLİYORUZ 🌟
        $receiverId = $conversation->user_one_id === $userId 
                        ? $conversation->user_two_id 
                        : $conversation->user_one_id;

        // Metin yerine JSON datası yolluyoruz! 
        // Böylece React tarafı bu JSON'u çözüp içindeki 'link' bilgisine gidecek.
        $notificationData = json_encode([
            'text' => Auth::user()->name . " sent you an encrypted message.",
            'link' => '/chat/' . $userId // Mesajı atan kişinin ID'sine giden rotayı göm
        ]);

        $notification = Notification::create([
            'user_id' => $receiverId,
            'type' => 'message',
            'message' => $notificationData // Json stringini veritabanına yaz
        ]);

        broadcast(new NewNotification($notification))->toOthers();

        return response()->json($message); 
    }
}
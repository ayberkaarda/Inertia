<?php
namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Notification; // 🌟 YENİ EKLENDİ
use App\Events\MessageSent;
use App\Events\NewNotification; // 🌟 YENİ EKLENDİ
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    // 🌟 INBOX SAYFASI: Tüm konuşmaları (son mesaj ve saatleriyle) listele
    public function index()
    {
        $userId = Auth::id();
        
        $conversations = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne', 'userTwo', 'messages' => function($query) {
                $query->latest()->limit(1); // Gelen kutusunda sadece son mesajı gösteririz
            }])
            ->get()
            ->map(function ($conv) use ($userId) {
                // Karşımdaki kişi kim?
                $otherUser = $conv->user_one_id === $userId ? $conv->userTwo : $conv->userOne;
                $lastMessage = $conv->messages->first();
                
                return [
                    'id' => $conv->id,
                    'other_user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar' => $otherUser->avatar, // Eğer profil fotosu varsa
                    ],
                    'last_message' => $lastMessage ? $lastMessage->body : 'No messages yet...',
                    // Son mesajın saatini "2 saat önce" veya "14:30" formatında göster
                    'time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '',
                ];
            });

        return Inertia::render('Chat/Inbox', [
            'conversations' => $conversations
        ]);
    }

    // 🌟 SOHBET ODASI: Belirli bir kişiye tıklandığında çalışır
    public function show(User $receiver)
    {
        $userId = Auth::id();

        // 1. İki kişi arasındaki mevcut konuşmayı bul veya yoksa yeni bir oda (Conversation) yarat
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

        // 2. Geçmiş mesajları çekerken saatleri ve gönderen bilgisini hazırla
        $messages = $conversation->messages()->with('sender')->get();

        return Inertia::render('Chat/Room', [
            'conversation' => $conversation,
            'messages' => $messages,
            'receiver' => $receiver,
            'currentUser' => Auth::user(),
        ]);
    }

    // 🌟 MESAJI FIRLAT: Reverb'ün tetiklendiği yer
    public function store(Request $request, Conversation $conversation)
    {
        $request->validate(['body' => 'required|string']);

        $userId = Auth::id();

        // 1. Mesajı veritabanına kaydet (Saat otomatik olarak 'created_at' içine yazılır)
        $message = $conversation->messages()->create([
            'sender_id' => $userId,
            'body' => $request->body,
        ]);

        // 2. Modeldeki sender bilgisini yükle ki beyaz ekran yemesinler
        $message->load('sender');

        // 3. REVERB İLE MESAJI KARŞI TARAFA FIRLAT! (Gerçek zamanlı sohbet büyüsü)
        broadcast(new MessageSent($message))->toOthers();

        // 🌟 4. YENİ: BİLDİRİM (NOTIFICATION) OLUŞTUR VE BİLDİRİM ÇANINA FIRLAT 🌟
        
        // Karşı tarafın ID'sini bulalım
        $receiverId = $conversation->user_one_id === $userId 
                        ? $conversation->user_two_id 
                        : $conversation->user_one_id;

        // Veritabanına bildirimi yazalım
        $notification = Notification::create([
            'user_id' => $receiverId,
            'type' => 'message',
            'message' => Auth::user()->name . " sent you an encrypted message."
        ]);

        // Reverb ile karşı tarafın header'ındaki zili titreştirelim!
        broadcast(new NewNotification($notification))->toOthers();

        // React tarafında (axios) işlemi için gönderilen mesajı geri dön
        return response()->json($message); 
    }
}
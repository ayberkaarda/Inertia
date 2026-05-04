<?php
namespace App\Http\Controllers;

use App\Models\Sprint;
use App\Models\Card;
use App\Models\Badge;
use App\Models\Skill;
use App\Events\SprintUpdated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SprintController extends Controller
{
    public function index()
    {
        Sprint::whereIn('status', ['planned', 'active'])
              ->whereDate('end_date', '<', now()->toDateString())
              ->update(['status' => 'expired']);

        // 🌟 GÜNCELLEME: tasks.users ekleyerek göreve katılanların fotoğraflarını da çekiyoruz
        $sprints = Sprint::with(['tasks.users'])->latest()->get();

        return Inertia::render('Sprints/Index', [
            'initialSprints' => $sprints,
            // 🌟 YENİ: DİNAMİK VERİ ÇEKİMİ 🌟
            // Veritabanındaki tablolardan sadece 'name' sütunlarını bir dizi olarak çeker
            'availableBadges' => Badge::pluck('name'),
            'availableSkills' => Skill::pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create-sprint');

        // 💡 İpucu: React'ten badges ve core_skills de geliyor, 
        // veritabanı (Migration) ve Model ($fillable) yapını buna göre güncellediğinden emin ol!
        $request->validate(['name' => 'required', 'end_date' => 'required|date']);
        Sprint::create($request->all());
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 SPRINT DÜZENLEME (Çoklu Yetenekler Dahil) 🌟
    public function update(Request $request, Sprint $sprint)
    {
        Gate::authorize('create-sprint');
        $request->validate(['name' => 'required', 'end_date' => 'required|date']);
        
        $sprint->update($request->all());
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 SPRINT SİLME 🌟
    public function destroy(Sprint $sprint)
    {
        Gate::authorize('create-sprint');
        // Sprint silindiğinde ona bağlı görevler (tasks) veritabanı kuralına göre silinir veya boşa çıkar.
        $sprint->delete();
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function updateStatus(Request $request, Sprint $sprint)
    {
        $sprint->update(['status' => $request->status]);
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function storeTask(Request $request, Sprint $sprint)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'complexity_level' => 'required|integer|min:1|max:10'
        ]);

        $sprint->tasks()->create([
            'title' => $request->title,
            'complexity_level' => $request->complexity_level,
            'list_id' => 1,
            'user_id' => Auth::id() // 👈 Görevi kimin oluşturduğunu kaydediyoruz
        ]);

        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 GÖREV (TASK) DÜZENLEME 🌟
    public function updateTask(Request $request, Card $card)
    {
        Gate::authorize('edit-task', $card);
        $request->validate([
            'title' => 'required|string|max:255',
            'complexity_level' => 'required|integer|min:1|max:10'
        ]);

        $card->update([
            'title' => $request->title,
            'complexity_level' => $request->complexity_level
        ]);

        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 GÖREV (TASK) SİLME 🌟
    public function destroyTask(Card $card)
    {
        Gate::authorize('delete-task', $card);
        $card->delete();
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 ADMİN YETKİSİ: BAŞKA KULLANICIYI GÖREVE ATA 🌟
    public function assignUserToTask(Request $request, Card $card)
    {
        // 1. Sadece Admin bu işlemi yapabilir
        Gate::authorize('assign-tasks');

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // 2. Seçilen kullanıcıyı bu göreve (Task) bağla
        $card->users()->syncWithoutDetaching([$request->user_id]);
        
        \App\Events\SprintUpdated::dispatch();
        return redirect()->back();
    }

    // 🌟 GÖREVE KATILMA FONKSİYONU 🌟
    public function joinTask(Card $card)
    {
        // Oturum açan kullanıcıyı bu göreve bağla (zaten bağlıysa hata vermez)
        $card->users()->syncWithoutDetaching([Auth::id()]);
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    // Görev tamamlama durumunu değiştir (Aç/Kapat)
    public function toggleTaskCompletion(Card $card)
    {
        // Güvenlik: Eğer zaten bitmişse tekrar işlem yapma
        if ($card->is_completed) {
            return redirect()->back();
        }

        // 1. Görevi veritabanında bitir
        $card->update([
            'is_completed' => true
        ]);
        
        // 🎯 ÇÖZÜM BURADA: Ölümcül Beyaz Ekranı (White Screen) önlemek için
        // Event fırlatılmadan ve döngülere girilmeden önce tüm ilişkileri (relations) yüklüyoruz.
        $card->load(['users', 'badges']);

        // 🌟 2. OYUNLAŞTIRMA (GAMIFICATION): ROZET DAĞITIMI 🌟
        // Bu göreve atanmış (join yapmış) tüm kullanıcıları bul
        foreach ($card->users as $user) {
            // Görevin gerektirdiği rozetleri bul (Görevde React, PHP vs. isteniyorsa)
            foreach ($card->badges as $badge) {
                // Kullanıcıya bu rozeti ver veya zaten varsa süresini 60 gün (2 Ay) uzat!
                $user->badges()->syncWithoutDetaching([
                    $badge->id => [
                        'last_earned_at' => now(),
                        'expires_at' => now()->addDays(60) // 2 Ay sonra expire olur
                    ]
                ]);
            }
        }

        // 🌟 3. ÖNEMLİ: Diğer ekranlara "Haber ver" (WebSocket)
        \App\Events\SprintUpdated::dispatch();

        return redirect()->back();
    }
}
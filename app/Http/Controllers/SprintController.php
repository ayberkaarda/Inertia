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
            'availableBadges' => Badge::pluck('name'),
            'availableSkills' => Skill::pluck('name'),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create-sprint');

        $request->validate([
            'name' => 'required', 
            'end_date' => 'required|date'
        ]);

        // 🌟 ÇÖZÜM BURADA: React'ten gelen required_skill verisini ZORLA veritabanına yazıyoruz!
        Sprint::create([
            'name' => $request->name,
            'end_date' => $request->end_date,
            'required_skill' => $request->required_skill ?? '', // Eğer boşsa boş string ata
            'status' => 'planned' // Yeni sprintler varsayılan olarak planned (planlandı) başlar
        ]);
        
        SprintUpdated::dispatch();
        
        return redirect()->route('sprints.index');
    }

    public function update(Request $request, Sprint $sprint)
    {
        Gate::authorize('create-sprint');
        $request->validate(['name' => 'required', 'end_date' => 'required|date']);
        
        $sprint->update($request->all());
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function destroy(Sprint $sprint)
    {
        Gate::authorize('create-sprint');
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

    // 🎯 İŞTE KRİTİK DEĞİŞİKLİK BURADA: Görev oluşturulurken Sprint'in yetenekleri göreve de kopyalanıyor!
    public function storeTask(Request $request, Sprint $sprint)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'complexity_level' => 'required|integer|min:1|max:10'
        ]);

        $card = new Card();
        $card->title = $request->title;
        $card->complexity_level = $request->complexity_level;
        $card->list_id = 1; 
        $card->sprint_id = $sprint->id;
        
        // 🌟 ÇÖZÜM: user_id sütununu sildik. Sadece boş olmaması gereken diğer sütunları yolluyoruz.
        $card->position = 0;         
        $card->description = '';     
        
        $card->save(); 

        // 🌟 KULLANICIYI DOĞRU YERE BAĞLIYORUZ: Görevi oluşturan kişiyi pivot (ara) tabloya ekliyoruz.
        $card->users()->syncWithoutDetaching([\Illuminate\Support\Facades\Auth::id()]);

        // SPRINT'İN YETENEKLERİNİ GÖREVE MİRAS BIRAKIYORUZ
        if (!empty($sprint->required_skill)) {
            $itemNames = array_map('trim', explode(',', $sprint->required_skill));
            
            // 1. Yetenekleri (Skills) Bağla
            $skillIds = \App\Models\Skill::whereIn('name', $itemNames)->pluck('id')->toArray();
            if (!empty($skillIds)) {
                $card->requiredSkills()->syncWithoutDetaching($skillIds); 
            }
            
            // 2. Rozetleri (Badges) Bağla
            $badgeIds = \App\Models\Badge::whereIn('name', $itemNames)->pluck('id')->toArray();
            if (!empty($badgeIds)) {
                $card->badges()->syncWithoutDetaching($badgeIds); 
            }
        }

        \App\Events\SprintUpdated::dispatch();
        
        return redirect()->route('sprints.index');
    }

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

    public function destroyTask(Card $card)
    {
        Gate::authorize('delete-task', $card);
        $card->delete();
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function assignUserToTask(Request $request, Card $card)
    {
        Gate::authorize('assign-tasks');

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $card->users()->syncWithoutDetaching([$request->user_id]);
        
        \App\Events\SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function joinTask(Card $card)
    {
        $card->users()->syncWithoutDetaching([Auth::id()]);
        
        SprintUpdated::dispatch();
        return redirect()->back();
    }

    public function toggleTaskCompletion(Card $card)
    {
        if ($card->is_completed) {
            return redirect()->back();
        }

        $card->update([
            'is_completed' => true
        ]);
        
        $card->load(['users', 'badges']);

        foreach ($card->users as $user) {
            foreach ($card->badges as $badge) {
                $user->badges()->syncWithoutDetaching([
                    $badge->id => [
                        'last_earned_at' => now(),
                        'expires_at' => now()->addDays(60)
                    ]
                ]);
            }
        }

        \App\Events\SprintUpdated::dispatch();

        return redirect()->back();
    }
}
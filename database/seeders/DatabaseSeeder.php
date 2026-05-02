<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BoardList;
use App\Models\Board;
use App\Models\Card;
use App\Models\Skill;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(SkillSeeder::class);
        $this->call(BadgeSeeder::class);

        $user = User::updateOrCreate(
            ['email' => 'ayberk@test.com'],
            ['name' => 'Ayberk Arda', 'role' => 'admin', 'password' => bcrypt('123456')]
        );

        // 🚀 TEMİZLİK
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Card::truncate();
        DB::table('card_user')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $workspace = Workspace::firstOrCreate(
            ['slug' => 'kultur-uni-projeleri'],
            ['name' => 'Kültür Üni Projeleri', 'owner_id' => $user->id]
        );

        $board = Board::firstOrCreate(
            ['workspace_id' => $workspace->id],
            ['title' => 'Yazılım Projesi Panosu']
        );

        $list = BoardList::firstOrCreate(
            ['board_id' => $board->id],
            ['title' => 'Yapılacaklar']
        );

        // 📊 GRAFİK İÇİN "HAYALET" VERİLER (Sadece Geçmiş Kayıtlar)
        // Bu görevler 'is_completed' true olduğu için aktif listelerde GÖZÜKMEZ.
        for ($i = 1; $i <= 6; $i++) {
            $card = Card::create([
                'list_id' => $list->id,
                'title' => "Archived Task System Log #" . rand(100, 999),
                'description' => 'Historical data for efficiency metrics.',
                'complexity_level' => rand(5, 10),
                'estimated_hours' => rand(15, 25),
                'actual_hours' => rand(12, 28),
                'is_completed' => true, // 👈 Kritik nokta: Aktif tasklarda gözükmez!
                'created_at' => now()->subMonths(7 - $i), // Son 6 aya yayar
            ]);

            $card->users()->attach($user->id);
        }
    }
}
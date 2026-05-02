<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        // Görseldeki dosya isimlerine göre eşleştirme yapıyoruz
        $badges = [
            ['name' => 'Angular', 'category' => 'frontend', 'icon' => 'badgets/angular.png'],
            ['name' => 'C++', 'category' => 'backend', 'icon' => 'badgets/cplus.png'],
            ['name' => 'C#', 'category' => 'backend', 'icon' => 'badgets/csharp.png'],
            ['name' => 'CSS', 'category' => 'frontend', 'icon' => 'badgets/css.png'],
            ['name' => 'HTML5', 'category' => 'frontend', 'icon' => 'badgets/html.png'],
            ['name' => 'Java', 'category' => 'backend', 'icon' => 'badgets/java.png'],
            ['name' => 'Javascript', 'category' => 'frontend', 'icon' => 'badgets/javascript.png'],
            ['name' => 'Laravel', 'category' => 'backend', 'icon' => 'badgets/laravel.png'],
            ['name' => 'PHP', 'category' => 'backend', 'icon' => 'badgets/php.png'],
            ['name' => 'React', 'category' => 'frontend', 'icon' => 'badgets/react.png'],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['name' => $badge['name']], // İsimle kontrol et
                [
                    'category' => $badge['category'],
                    'icon' => $badge['icon'] // Klasör yolu: badgets/dosya.png
                ]
            );
        }
    }
}
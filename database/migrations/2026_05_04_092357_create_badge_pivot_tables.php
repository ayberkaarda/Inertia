<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Görevler (Cards) ve Rozetler (Badges) arasındaki köprü tablo
        Schema::create('badge_card', function (Blueprint $table) {
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('card_id')->constrained()->cascadeOnDelete();
            $table->primary(['badge_id', 'card_id']);
        });

        // Kullanıcılar (Users) ve Rozetler (Badges) arasındaki köprü tablo
        Schema::create('badge_user', function (Blueprint $table) {
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Kodundaki "süresini 60 gün uzat" yorumuna istinaden pivot kolonları gerekebilir
            // Eğer süre takibi yapıyorsan expires_at gibi kolonları buraya ekleyebilirsin.
            
            $table->primary(['badge_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('badge_user');
        Schema::dropIfExists('badge_card');
    }
};
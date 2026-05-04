<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eğer badge_card tablosu yoksa oluştur
        if (!Schema::hasTable('badge_card')) {
            Schema::create('badge_card', function (Blueprint $table) {
                $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
                $table->foreignId('card_id')->constrained()->cascadeOnDelete();
                $table->primary(['badge_id', 'card_id']);
            });
        }

        // Eğer badge_user tablosu yoksa oluştur
        if (!Schema::hasTable('badge_user')) {
            Schema::create('badge_user', function (Blueprint $table) {
                $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->primary(['badge_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('badge_user');
        Schema::dropIfExists('badge_card');
    }
};
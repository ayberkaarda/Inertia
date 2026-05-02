<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rozetlerin (React, PHP vb.) tutulduğu tablo
        Schema::create('badges', function (Blueprint $table) {
        $table->id();
        $table->string('name'); // Örn: React, PHP, Laravel
        $table->enum('category', ['frontend', 'backend', 'devops', 'general']); 
        $table->string('icon')->nullable(); // Emoji veya ikon yolu
        $table->timestamps();
    });

    // Kullanıcıların sahip olduğu rozetleri ve SON KULLANMA TARİHLERİNİ tutan tablo
    Schema::create('badge_user', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
        $table->timestamp('last_earned_at')->nullable(); 
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};

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
    Schema::create('sprints', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->enum('status', ['planned', 'active', 'completed', 'expired'])->default('planned');
        $table->date('end_date')->nullable(); // Bitiş tarihi
        $table->string('required_skill')->nullable(); // Basitçe yeteneği string tutalım
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sprints');
    }
};

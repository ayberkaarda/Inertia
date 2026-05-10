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
        Schema::table('user_skill', function (Blueprint $table) {
            // Eğer sütun yoksa ekle (hata vermemesi için güvenlik önlemi)
            if (!Schema::hasColumn('user_skill', 'tasks_completed')) {
                $table->integer('tasks_completed')->default(0)->after('proficiency_level');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_skill', function (Blueprint $table) {
            $table->dropColumn('tasks_completed');
        });
    }
};

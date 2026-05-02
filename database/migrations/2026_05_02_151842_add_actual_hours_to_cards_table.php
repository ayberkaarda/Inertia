<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('cards', function (Blueprint $table) {
        // estimated_hours'dan sonra ekleyelim ki tablo düzenli dursun
        $table->integer('actual_hours')->nullable()->after('estimated_hours');
        $table->boolean('is_completed')->default(false)->after('actual_hours');
    });
}

public function down()
{
    Schema::table('cards', function (Blueprint $table) {
        $table->dropColumn(['actual_hours', 'is_completed']);
    });
}
};

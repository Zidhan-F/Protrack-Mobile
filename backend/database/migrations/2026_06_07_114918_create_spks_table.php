<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('spks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->onDelete('cascade');

            $table->foreignId('production_department_id')
                ->constrained('production_departments')
                ->onDelete('cascade');

            $table->string('no_spk')->unique();

            $table->date('tanggal_spk');

            $table->date('deadline_date')->nullable();

            $table->enum('priority', [
                'normal',
                'high',
                'urgent'
            ])->default('normal');

            $table->enum('status', [
                'belum_diproses',
                'sedang_diproses',
                'menunggu_finishing',
                'sedang_finishing',
                'selesai',
                'terlambat'
            ])->default('belum_diproses');

            $table->text('keterangan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('spks');
    }
}

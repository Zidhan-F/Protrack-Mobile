<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpkDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('spk_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('spk_id')
                ->constrained('spks')
                ->onDelete('cascade');

            $table->string('nama_file');

            $table->string('bahan')->nullable();

            $table->decimal('panjang', 10, 2)->nullable();

            $table->decimal('lebar', 10, 2)->nullable();

            $table->integer('qty');

            $table->string('finishing')->nullable();

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
        Schema::dropIfExists('spk_details');
    }
}

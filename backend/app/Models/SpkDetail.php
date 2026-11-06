<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpkDetail extends Model
{
    protected $fillable = [

        'spk_id',

        'nama_file',

        'bahan',

        'panjang',

        'lebar',

        'qty',

        'finishing'

    ];

    /**
     * Relasi ke SPK
     */
    public function spk()
    {
        return $this->belongsTo(
            Spk::class
        );
    }

    /**
     * Hitung luas otomatis
     */
    public function getLuasAttribute()
    {
        if (!$this->panjang || !$this->lebar) {
            return 0;
        }

        return $this->panjang * $this->lebar;
    }

    /**
     * Hitung total produksi
     */
    public function getTotalProduksiAttribute()
    {
        if (!$this->qty) {
            return 0;
        }

        return $this->qty;
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [

        'nama_customer'

    ];

    /**
     * Relasi ke SPK
     */
    public function spks()
    {
        return $this->hasMany(
            Spk::class
        );
    }

    /**
     * Total SPK Customer
     */
    public function getTotalSpkAttribute()
    {
        return $this->spks()->count();
    }

    /**
     * SPK Selesai
     */
    public function getTotalSelesaiAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                'selesai'
            )
            ->count();
    }

    /**
     * SPK Belum Selesai
     */
    public function getTotalAktifAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                '!=',
                'selesai'
            )
            ->count();
    }
}
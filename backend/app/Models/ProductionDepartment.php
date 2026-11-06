<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductionDepartment extends Model
{
    protected $fillable = [

        'nama_bagian'

    ];

    /**
     * Relasi ke SPK
     */
    public function spks()
    {
        return $this->hasMany(
            Spk::class,
            'production_department_id'
        );
    }

    /**
     * Total SPK
     */
    public function getTotalSpkAttribute()
    {
        return $this->spks()->count();
    }

    /**
     * SPK Belum Diproses
     */
    public function getBelumDiprosesAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                'belum_diproses'
            )
            ->count();
    }

    /**
     * SPK Sedang Diproses
     */
    public function getSedangDiprosesAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                'sedang_diproses'
            )
            ->count();
    }

    /**
     * SPK Selesai
     */
    public function getSelesaiAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                'selesai'
            )
            ->count();
    }

    /**
     * SPK Terlambat
     */
    public function getTerlambatAttribute()
    {
        return $this->spks()
            ->where(
                'status',
                'terlambat'
            )
            ->count();
    }

    /**
     * SPK Prioritas Urgent
     */
    public function getUrgentAttribute()
    {
        return $this->spks()
            ->where(
                'priority',
                'urgent'
            )
            ->count();
    }
}
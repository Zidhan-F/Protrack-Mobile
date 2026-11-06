<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Spk extends Model
{
    protected $fillable = [

        'customer_id',

        'production_department_id',

        'no_spk',

        'tanggal_spk',

        'deadline_date',

        'priority',

        'status',

        'keterangan'

    ];

    /**
     * Relasi Customer
     */
    public function customer()
    {
        return $this->belongsTo(
            Customer::class
        );
    }

    /**
     * Relasi Department
     */
    public function department()
    {
        return $this->belongsTo(
            ProductionDepartment::class,
            'production_department_id'
        );
    }

    /**
     * Relasi Detail Item
     */
    public function details()
    {
        return $this->hasMany(
            SpkDetail::class
        );
    }

    /**
     * Relasi Progress Log
     */
    public function progressLogs()
    {
        return $this->hasMany(
            ProgressLog::class
        );
    }

    /**
     * Scope SPK Selesai
     */
    public function scopeSelesai($query)
    {
        return $query->where(
            'status',
            'selesai'
        );
    }

    /**
     * Scope SPK Terlambat
     */
    public function scopeTerlambat($query)
    {
        return $query->where(
            'status',
            'terlambat'
        );
    }

    /**
     * Scope Priority Urgent
     */
    public function scopeUrgent($query)
    {
        return $query->where(
            'priority',
            'urgent'
        );
    }

    public function updatePriority()
    {
        if ($this->status == "selesai") {
            $this->priority = "normal";
            return;
        }

        $today = now()->startOfDay();
        $deadline = Carbon::parse($this->deadline_date);

        $days = $today->diffInDays($deadline, false);

        if ($days < 0) {
            $this->priority = "urgent";
        } elseif ($days <= 2) {
            $this->priority = "urgent";
        } elseif ($days <= 7) {
            $this->priority = "high";
        } else {
            $this->priority = "normal";
        }
    }
}
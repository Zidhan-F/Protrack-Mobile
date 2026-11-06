<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressLog extends Model
{
    /**
     * Table
     */
    protected $table = 'progress_logs';

    /**
     * Karena migration hanya punya created_at
     */
    public $timestamps = false;

    /**
     * Mass Assignment
     */
    protected $fillable = [

        'spk_id',

        'user_id',

        'old_status',

        'new_status',

        'catatan'

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
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(
            User::class
        );
    }
}
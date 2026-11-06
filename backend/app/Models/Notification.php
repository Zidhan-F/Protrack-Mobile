<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'spk_id',
        'title',
        'message',
        'is_read'
    ];

    public function spk()
    {
        return $this->belongsTo(
            Spk::class
        );
    }
}
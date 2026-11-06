<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    /**
     * Mass Assignment
     */
    protected $fillable = [

        'name',

        'email',

        'password',

        'role'

    ];

    /**
     * Hidden Attribute
     */
    protected $hidden = [

        'password',

        'remember_token'

    ];

    /**
     * Cast
     */
    protected $casts = [

        'email_verified_at' => 'datetime'

    ];

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
     * Cek Admin
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Cek Develop
     */
    public function isDevelop()
    {
        return $this->role === 'develop';
    }

    /**
     * Cek Offset
     */
    public function isOffset()
    {
        return $this->role === 'offset';
    }

    /**
     * Cek Plotter
     */
    public function isPlotter()
    {
        return $this->role === 'plotter';
    }

    /**
     * Cek UV
     */
    public function isUv()
    {
        return $this->role === 'uv';
    }

    /**
     * Cek Finishing
     */
    public function isFinishing()
    {
        return $this->role === 'finishing';
    }

    /**
     * Role operator => ID departemen produksi (lihat DatabaseSeeder).
     */
    public const DEPARTMENT_BY_ROLE = [
        'develop'   => 1,
        'offset'    => 2,
        'plotter'   => 3,
        'uv'        => 4,
        'finishing' => 5,
    ];

    /**
     * Seluruh status SPK yang valid.
     */
    public const SPK_STATUSES = [
        'belum_diproses',
        'sedang_diproses',
        'menunggu_finishing',
        'sedang_finishing',
        'selesai',
        'terlambat',
    ];

    /**
     * Operator = semua role selain admin.
     */
    public function isOperator()
    {
        return isset(self::DEPARTMENT_BY_ROLE[$this->role]);
    }

    /**
     * ID departemen milik operator (null untuk admin).
     */
    public function departmentId()
    {
        return self::DEPARTMENT_BY_ROLE[$this->role] ?? null;
    }

    /**
     * Boleh melihat / mengerjakan SPK ini?
     * Admin: semua. Operator: hanya SPK di departemennya.
     */
    public function canAccessSpk($spk)
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->isOperator()
            && (int) $spk->production_department_id === $this->departmentId();
    }

    /**
     * Status yang boleh di-set oleh role ini.
     */
    public function allowedStatuses()
    {
        if ($this->isAdmin()) {
            return self::SPK_STATUSES;
        }

        if ($this->isFinishing()) {
            return ['sedang_finishing', 'selesai'];
        }

        if ($this->isOperator()) {
            // 'selesai' dari departemen cetak otomatis diteruskan ke Finishing
            return ['sedang_diproses', 'selesai'];
        }

        return [];
    }

    /**
     * Nama Role Yang Lebih Rapi
     */
    public function getRoleLabelAttribute()
    {
        return match ($this->role) {

            'admin' => 'Administrator',

            'develop' => 'Develop',

            'offset' => 'Offset',

            'plotter' => 'Plotter',

            'uv' => 'UV',

            'finishing' => 'Finishing',

            default => 'User'

        };
    }
}
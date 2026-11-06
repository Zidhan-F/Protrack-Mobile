<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spk;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $user = $request->user();

        // RBAC: operator hanya melihat statistik departemennya sendiri
        $deptId = ($user && $user->isOperator()) ? $user->departmentId() : null;

        $base = function () use ($deptId) {
            return Spk::query()->when($deptId, function ($q) use ($deptId) {
                $q->where('production_department_id', $deptId);
            });
        };

        $latest = $base()
        ->with([
            'customer',
            'department'
        ])
        ->latest()
        ->take(5)
        ->get();

        return response()->json([

            "totalSpk" => $base()->count(),

            "belumDiproses" =>
                $base()->where("status","belum_diproses")->count(),

            "sedangDiproses" =>
                $base()->where("status","sedang_diproses")->count(),

            "menungguFinishing" =>
                $base()->where("status","menunggu_finishing")->count(),

            "sedangFinishing" =>
                $base()->where("status","sedang_finishing")->count(),

            "selesai" =>
                $base()->where("status","selesai")->count(),

            "spkTerlambat" =>
                $base()->whereDate("deadline_date","<",$today)
                ->where("status","!=","selesai")
                ->count(),

            "deadlineBesok" =>
                $base()->whereDate(
                    "deadline_date",
                    Carbon::tomorrow()
                )->count(),

            "urgent" =>
                $base()->where("priority","urgent")->count(),

            "statusChart" => [

                $base()->where("status","belum_diproses")->count(),

                $base()->where("status","sedang_diproses")->count(),

                $base()->where("status","menunggu_finishing")->count(),

                $base()->where("status","sedang_finishing")->count(),

                $base()->where("status","selesai")->count(),

                $base()->whereDate("deadline_date","<",$today)
                    ->where("status","!=","selesai")
                    ->count(),

            ],

            "departmentChart" => [

                $base()->where("production_department_id",1)->count(),

                $base()->where("production_department_id",2)->count(),

                $base()->where("production_department_id",3)->count(),

                $base()->where("production_department_id",4)->count(),

                $base()->where("production_department_id",5)->count(),

            ],

            "latestSpks" => $latest

        ]);
    }
}
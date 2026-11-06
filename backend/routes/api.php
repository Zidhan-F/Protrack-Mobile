<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpkController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| Publik
|--------------------------------------------------------------------------
| /register tetap publik untuk operator, tetapi pembuatan akun admin
| hanya diizinkan bagi admin yang login (dicek di AuthController).
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
|--------------------------------------------------------------------------
| Terautentikasi (semua role)
|--------------------------------------------------------------------------
| Pembatasan per departemen untuk operator dilakukan di controller.
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/spk', [SpkController::class, 'index']);
    Route::get('/spk/{id}', [SpkController::class, 'show']);
    Route::post('/spk/{id}/update-status', [SpkController::class, 'updateStatus']);

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/departments', [DepartmentController::class, 'index']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Khusus Administrator
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {

        Route::post('/spk/store', [SpkController::class, 'store']);
        Route::post('/spk/{id}/update', [SpkController::class, 'update']);
        Route::delete('/spk-detail/{id}', [SpkController::class, 'deleteDetail']);

        Route::post('/import-xml', [ImportController::class, 'import']);

    });

});

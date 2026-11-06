<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (API Server Info)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'app' => 'ProTrack API Backend',
        'status' => 'online',
        'api' => url('/api')
    ]);
});

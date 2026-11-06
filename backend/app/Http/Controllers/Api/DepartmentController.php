<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionDepartment;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(
            ProductionDepartment::orderBy('nama_bagian')->get()
        );
    }
}
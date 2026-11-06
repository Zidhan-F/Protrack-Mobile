<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index()
    {
        return response()->json(
            Customer::orderBy('nama_customer')->get()
        );
    }
}
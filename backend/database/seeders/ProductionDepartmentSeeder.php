<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductionDepartment;

class ProductionDepartmentSeeder extends Seeder
{
    public function run()
    {
        ProductionDepartment::create([
            'nama_bagian' => 'Develop'
        ]);

        ProductionDepartment::create([
            'nama_bagian' => 'Offset'
        ]);

        ProductionDepartment::create([
            'nama_bagian' => 'Plotter'
        ]);

        ProductionDepartment::create([
            'nama_bagian' => 'UV'
        ]);

        ProductionDepartment::create([
            'nama_bagian' => 'Finishing'
        ]);
    }
}
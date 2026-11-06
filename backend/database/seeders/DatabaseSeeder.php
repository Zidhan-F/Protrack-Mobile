<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\ProductionDepartment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        /*
        |--------------------------------------------------------------------------
        | User Admin
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'admin@protrack.com'
            ],

            [
                'name' => 'Administrator',

                'password' => Hash::make('password'),

                'role' => 'admin'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | User Develop
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'develop@protrack.com'
            ],

            [
                'name' => 'Develop',

                'password' => Hash::make('password'),

                'role' => 'develop'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | User Offset
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'offset@protrack.com'
            ],

            [
                'name' => 'Offset',

                'password' => Hash::make('password'),

                'role' => 'offset'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | User Plotter
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'plotter@protrack.com'
            ],

            [
                'name' => 'Plotter',

                'password' => Hash::make('password'),

                'role' => 'plotter'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | User UV
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'uv@protrack.com'
            ],

            [
                'name' => 'UV',

                'password' => Hash::make('password'),

                'role' => 'uv'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | User Finishing
        |--------------------------------------------------------------------------
        */

        User::updateOrCreate(

            [
                'email' => 'finishing@protrack.com'
            ],

            [
                'name' => 'Finishing',

                'password' => Hash::make('password'),

                'role' => 'finishing'
            ]

        );

        /*
        |--------------------------------------------------------------------------
        | Department
        |--------------------------------------------------------------------------
        */

        ProductionDepartment::updateOrCreate(
            ['id' => 1],
            ['nama_bagian' => 'Develop']
        );

        ProductionDepartment::updateOrCreate(
            ['id' => 2],
            ['nama_bagian' => 'Offset']
        );

        ProductionDepartment::updateOrCreate(
            ['id' => 3],
            ['nama_bagian' => 'Plotter']
        );

        ProductionDepartment::updateOrCreate(
            ['id' => 4],
            ['nama_bagian' => 'UV']
        );

        ProductionDepartment::updateOrCreate(
            ['id' => 5],
            ['nama_bagian' => 'Finishing']
        );
    }
}
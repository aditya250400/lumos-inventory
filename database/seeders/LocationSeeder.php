<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Get Users
        |--------------------------------------------------------------------------
        */

        $rizki = User::where('email', 'muhamadrizkiaditya32@gmail.com')->first();
        $imam = User::where('email', 'imam@gmail.com')->first();
        $indra = User::where('email', 'indra@gmail.com')->first();
        $razzan = User::where('email', 'razzan@gmail.com')->first();

        /*
        |--------------------------------------------------------------------------
        | Kembar
        |--------------------------------------------------------------------------
        */

        $kembar = Location::firstOrCreate(
            [
                'name' => 'Kembar',
                'parent_id' => null,
            ],
            [
                'slug' => Str::slug('Kembar'),
                'user_id' => null,
            ],
        );

        $kembarChildren = [
            [
                'name' => 'Meja Rizki',
                'user_id' => $rizki?->id,
            ],
            [
                'name' => 'Meja Imam',
                'user_id' => $imam?->id,
            ],
            [
                'name' => 'Meja Indra',
                'user_id' => $indra?->id,
            ],
            [
                'name' => 'Meja Razzan',
                'user_id' => $razzan?->id,
            ],
            [
                'name' => 'Meja Admin',
                'user_id' => null,
            ],
        ];

        foreach ($kembarChildren as $child) {
            Location::firstOrCreate(
                [
                    'name' => $child['name'],
                    'parent_id' => $kembar->id,
                ],
                [
                    'slug' => Str::slug($child['name']),
                    'user_id' => $child['user_id'],
                ],
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Maranatha
        |--------------------------------------------------------------------------
        */

        $maranatha = Location::firstOrCreate(
            [
                'name' => 'Maranatha',
                'parent_id' => null,
            ],
            [
                'slug' => Str::slug('Maranatha'),
                'user_id' => null,
            ],
        );

        $maranathaChildren = [
            [
                'name' => 'Meja A',
                'user_id' => null,
            ],
            [
                'name' => 'Meja B',
                'user_id' => null,
            ],
            [
                'name' => 'Meja Unboxing',
                'user_id' => null,
            ],
            [
                'name' => 'Meja Admin',
                'user_id' => null,
            ],
        ];

        foreach ($maranathaChildren as $child) {
            Location::firstOrCreate(
                [
                    'name' => $child['name'],
                    'parent_id' => $maranatha->id,
                ],
                [
                    'slug' => Str::slug($child['name']),
                    'user_id' => $child['user_id'],
                ],
            );
        }
    }
}

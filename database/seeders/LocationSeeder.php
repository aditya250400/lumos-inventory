<?php

namespace Database\Seeders;

use App\Models\Location;
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
        $locations = ['Kembar', 'Maranatha',];
        foreach ($locations as $location) {
            Location::firstOrCreate(['name' => $location],  [
                'slug' => Str::slug($location),
            ]);
        }
    }
}

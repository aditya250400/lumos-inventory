<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ToolAttribute;
use Illuminate\Database\Seeder;

class ToolAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            'Harddisk' => [
                'Tipe Storage',
                'Kapasitas',
                'Serial Number',
                'Health',
                'Digunakan Untuk',
                'ID Lama Storage',
            ],

            'SSD' => [
                'Tipe Storage',
                'Kapasitas',
                'Serial Number',
                'Health',
                'Digunakan Untuk',
                'ID Lama Storage'
            ],

            'Flashdisk' => [
                'Kapasitas',
                'Digunakan Untuk',
                'Kode Lama',
            ],

            'Charger' => [
                'Tegangan',
                'Kabel Power',
                'ID Lama Charger'
            ],

            'Converter' => [
                'Tipe Converter',
                'ID Lama Converter'
            ],
        ];

        foreach ($attributes as $categoryName => $fields) {
            $category = Category::where('name', $categoryName)->firstOrFail();

            foreach ($fields as $fieldName) {
                ToolAttribute::firstOrCreate([
                    'field_name' => $fieldName,
                    'category_id' => $category->id,
                ]);
            }
        }
    }
}

<?php

namespace Database\Seeders;

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Models\Tool;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tools = [
            'Samsung 980 500GB NVMe SSD',
            'Kingston NV2 1TB NVMe SSD',
            'Crucial BX500 480GB SSD',
            'Kingston 8GB DDR4 RAM',
            'Corsair 16GB DDR4 RAM',
            'Lenovo 65W Laptop Charger',
            'ASUS 90W Laptop Charger',
            'SanDisk 64GB Flashdisk',
            'Kingston 128GB Flashdisk',
            'Seagate 1TB External Harddisk',
            'Logitech K120 Keyboard',
            'Logitech M185 Wireless Mouse',
            'AOC 24 Inch Monitor',
            'HDMI Cable 2 Meter',
            'USB Type-C Cable',
            'USB Type-C to HDMI Adapter',
            'VGA to HDMI Adapter',
            'WD Blue 1TB HDD',
            'Kingston 16GB DDR4 RAM',
            'Logitech M331 Wireless Mouse',
        ];

        foreach ($tools as $index => $name) {
            Tool::create([
                'tool_code' => 'TL-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'name' => $name,
                'stock' => fake()->numberBetween(1, 20),
                'note' => 'Tool inventory laptop.',
                'status' => ToolEnum::AVAILABLE->value,
                'inventory_type' => InventoryTypeEnum::INTERNAL->value,
                'category_id' => fake()->numberBetween(1, 10),
                'location_id' => $index < 10 ? 1 : 2,
                'used_by' => null,
            ]);
        }
    }
}

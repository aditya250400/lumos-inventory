<?php

namespace Database\Seeders;

use App\Enums\StockOpnameEnum;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StockOpnameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Stock Opname 1
        $stockOpname1 = StockOpname::create([
            'opname_date' => '2026-01-10',
            'note' => 'Stock opname periode Januari',
            'created_by' => 1,
            'location_id' => 1,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 10,
            'physical_stock' => 10,
            'status' => StockOpnameEnum::MATCH->value,
            'note' => 'Stok sesuai',
            'tool_id' => 1,
            'stock_opname_id' => $stockOpname1->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 20,
            'physical_stock' => 18,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'Stok fisik kurang 2',
            'tool_id' => 2,
            'stock_opname_id' => $stockOpname1->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 15,
            'physical_stock' => 17,
            'status' => StockOpnameEnum::GREATER->value,
            'note' => 'Stok fisik lebih 2',
            'tool_id' => 3,
            'stock_opname_id' => $stockOpname1->id,
        ]);

        // Stock Opname 2
        $stockOpname2 = StockOpname::create([
            'opname_date' => '2026-02-15',
            'note' => 'Stock opname periode Februari',
            'created_by' => 1,
            'location_id' => 1,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 10,
            'physical_stock' => 10,
            'status' => StockOpnameEnum::MATCH->value,
            'note' => 'Stok sesuai',
            'tool_id' => 1,
            'stock_opname_id' => $stockOpname2->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 25,
            'physical_stock' => 20,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'Stok fisik kurang 5',
            'tool_id' => 2,
            'stock_opname_id' => $stockOpname2->id,
        ]);

        // Stock Opname 3
        $stockOpname3 = StockOpname::create([
            'opname_date' => '2026-03-20',
            'note' => 'Stock opname periode Maret',
            'created_by' => 1,
            'location_id' => 1,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 10,
            'physical_stock' => 8,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'Stok fisik kurang 2',
            'tool_id' => 1,
            'stock_opname_id' => $stockOpname3->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 20,
            'physical_stock' => 20,
            'status' => StockOpnameEnum::MATCH->value,
            'note' => 'Stok sesuai',
            'tool_id' => 2,
            'stock_opname_id' => $stockOpname3->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 30,
            'physical_stock' => 27,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'Stok fisik kurang 3',
            'tool_id' => 3,
            'stock_opname_id' => $stockOpname3->id,
        ]);
        // Stock Opname 4
        $stockOpname4 = StockOpname::create([
            'opname_date' => '2026-07-21',
            'note' => 'Stock opname periode Juli',
            'created_by' => 1,
            'location_id' => 1,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 10,
            'physical_stock' => 10,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'cocok',
            'tool_id' => 1,
            'stock_opname_id' => $stockOpname4->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 20,
            'physical_stock' => 20,
            'status' => StockOpnameEnum::MATCH->value,
            'note' => 'Stok sesuai',
            'tool_id' => 2,
            'stock_opname_id' => $stockOpname4->id,
        ]);

        StockOpnameDetail::create([
            'system_stock' => 30,
            'physical_stock' => 30,
            'status' => StockOpnameEnum::LESS->value,
            'note' => 'Sesuai',
            'tool_id' => 3,
            'stock_opname_id' => $stockOpname4->id,
        ]);
    }
}

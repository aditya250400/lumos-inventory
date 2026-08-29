<?php

namespace Database\Seeders;

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\ToolAttribute;
use App\Models\ToolAttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChargerSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::where('name', 'Charger')->firstOrFail();

        $kembar = Location::where('name', 'Kembar')
            ->whereNull('parent_id')
            ->firstOrFail();

        $data = [
            ['merk' => 'Asus (Jack Universal)', 'tegangan' => '19V, 9.23A', 'id_lama' => '1', 'kabel_power' => 'Ada', 'note' => null],
            ['merk' => 'Dell (jack bulet kecil)', 'tegangan' => '19.5V, 3.42A', 'id_lama' => '2', 'kabel_power' => 'Tidak Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Acer (Jack Acer Biasa)', 'tegangan' => '19V, 3.42A', 'id_lama' => '3', 'kabel_power' => 'Tidak Ada', 'note' => 'Yang ini dicoba gajalan'],
            ['merk' => 'HP (jack biru)', 'tegangan' => '19.5V, 3.33A', 'id_lama' => '4', 'kabel_power' => 'Tidak Ada', 'note' => 'udah rusak'],
            ['merk' => 'Toshiba (Jack Agak besar)', 'tegangan' => '19V, 3.42A', 'id_lama' => '5', 'kabel_power' => 'Tidak Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Asus', 'tegangan' => '19V, 3.42a', 'id_lama' => '6', 'kabel_power' => 'tidak ada', 'note' => 'Barangnya gaada, masih dicari'],
            ['merk' => 'Asus', 'tegangan' => '19V, 3.42a', 'id_lama' => '7', 'kabel_power' => 'tidak ada', 'note' => 'udah rusak'],
            ['merk' => 'Toshiba (Jack Agak besar)', 'tegangan' => '19V, 3.95A', 'id_lama' => '8', 'kabel_power' => 'Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'HP (jack biru)', 'tegangan' => '19V, 7.7A', 'id_lama' => '9', 'kabel_power' => 'Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Lenovo (jack Kotak)', 'tegangan' => '20V, 2.2A', 'id_lama' => '10', 'kabel_power' => 'Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Asus (Jack Universal)', 'tegangan' => '19V, 4.74A', 'id_lama' => '11', 'kabel_power' => 'Ada', 'note' => 'Kabel power dipinjem bu yuli'],
            ['merk' => 'Acer', 'tegangan' => '19V, 3.42A', 'id_lama' => '12', 'kabel_power' => 'Tidak Ada', 'note' => 'Chargernya gaada, masih dicari'],
            ['merk' => 'Acer (Jack universal)', 'tegangan' => '19V, 7.7A', 'id_lama' => '13', 'kabel_power' => 'Tidak Ada', 'note' => 'Jack nya udah diganti jadi jack asus'],
            ['merk' => 'Lenovo (Jack Kotak)', 'tegangan' => '20V, 2.25A', 'id_lama' => '14', 'kabel_power' => 'Tidak Ada', 'note' => null],
            ['merk' => 'Acer (Jack Acer biasa)', 'tegangan' => '19V, 3.42A', 'id_lama' => '15', 'kabel_power' => 'Tidak Ada', 'note' => null],
            ['merk' => 'Macbook', 'tegangan' => '14.5V, 3.1A', 'id_lama' => '16', 'kabel_power' => 'Tidak Ada', 'note' => 'rusak'],
            ['merk' => 'Lenovo (jack besar pin kecil)', 'tegangan' => '20V, 3.25A', 'id_lama' => '17', 'kabel_power' => 'Ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Adaptor monitor tanpa merk', 'tegangan' => '19V, 2.58A', 'id_lama' => '18', 'kabel_power' => 'Tidak Ada', 'note' => null],
            ['merk' => 'PSU Adaptor', 'tegangan' => 'bisa disesuaikan', 'id_lama' => '19', 'kabel_power' => 'tidak ada', 'note' => 'Chargernya pake yg id lama nya 11'],
            ['merk' => 'HP (jack gede)', 'tegangan' => '18.5V 3.5A', 'id_lama' => '20', 'kabel_power' => 'tidak ada', 'note' => 'disimpen di meja resepsionis'],
            ['merk' => 'Acer (Jack acer biasa)', 'tegangan' => '19V, 2.15A', 'id_lama' => '21', 'kabel_power' => 'tidak ada', 'note' => 'Harus pake converter steker'],
            ['merk' => 'Asus (Jack kecil)', 'tegangan' => '19V, 2.1A', 'id_lama' => '22', 'kabel_power' => 'ada', 'note' => 'Disimpen di meja resepsionis'],
            ['merk' => 'Lenovo (jack kotak)', 'tegangan' => '20V, 3.25A', 'id_lama' => '23', 'kabel_power' => 'tidak ada', 'note' => null],
            ['merk' => 'YNS', 'tegangan' => '12V, 2A', 'id_lama' => '24', 'kabel_power' => 'tidak ada', 'note' => null],
            ['merk' => 'HP (Jack bulat besar)', 'tegangan' => '19V, 4.74A', 'id_lama' => '25', 'kabel_power' => 'ada', 'note' => 'Disimpan di meja resepsionis'],
            ['merk' => 'Lenovo (Jack kotak)', 'tegangan' => '20V, 3.25A', 'id_lama' => '26', 'kabel_power' => 'ada', 'note' => 'Disimpan di meja resepsionis'],
            ['merk' => 'Asus (Jack agak besar)', 'tegangan' => '19.5V, 6.15A', 'id_lama' => '27', 'kabel_power' => 'ada', 'note' => 'Disimpan di meja resepsionis'],
            ['merk' => 'Asus (Jack agak besar)', 'tegangan' => '19V, 2.37A', 'id_lama' => '28', 'kabel_power' => 'tidak ada', 'note' => 'Disimpan di meja resepsionis'],
            ['merk' => 'Asus (Jack kecil)', 'tegangan' => '19V, 2.37A', 'id_lama' => '29', 'kabel_power' => 'tidak ada', 'note' => 'Disimpan di meja resepsionis'],
            ['merk' => 'Asus (Jack kecil)', 'tegangan' => '19V, 1.75A', 'id_lama' => '30', 'kabel_power' => 'tidak ada', 'note' => null],
            ['merk' => 'Macbook Magsafe 1', 'tegangan' => '16.5V, 3.65A', 'id_lama' => '31', 'kabel_power' => 'tidak ada', 'note' => null],
            ['merk' => 'Macbook Magsafe 2', 'tegangan' => '16.5V, 3.65A', 'id_lama' => '32', 'kabel_power' => 'tidak ada', 'note' => null],
            ['merk' => 'Asus (Type C)', 'tegangan' => '20V, 5A', 'id_lama' => '33', 'kabel_power' => ' ada', 'note' => null],
            ['merk' => 'Lenovo Type C', 'tegangan' => '65W', 'id_lama' => '34', 'kabel_power' => ' ada', 'note' => 'Disimpen di meja resepsionis'],
            ['merk' => 'Lenovo Type C', 'tegangan' => '65W', 'id_lama' => '35', 'kabel_power' => ' ada', 'note' => null],
            ['merk' => 'Lenovo Type C', 'tegangan' => '19V 6.32A', 'id_lama' => '36', 'kabel_power' => ' ada', 'note' => 'Disimpen di meja resepsionis'],
            ['merk' => 'Asus', 'tegangan' => '19V 4.74A', 'id_lama' => '37', 'kabel_power' => ' ada', 'note' => null],
            ['merk' => 'Asus (Jack kecil)', 'tegangan' => '19V 3.42A', 'id_lama' => '38', 'kabel_power' => ' ada', 'note' => null],
            ['merk' => 'HP (jack biru)', 'tegangan' => '19V 2.31A', 'id_lama' => '39', 'kabel_power' => ' ada', 'note' => null],
            ['merk' => 'Asus ROG (Jack kecil)', 'tegangan' => '19V 6.32A', 'id_lama' => '40', 'kabel_power' => ' ada', 'note' => null],

        ];

        foreach ($data as $item) {
            DB::transaction(function () use ($item, $category, $kembar) {
                $status = $item['note'] !== null
                    && preg_match('/\brusak\b/i', $item['note'])
                    ? ToolEnum::DAMAGE->value
                    : ToolEnum::AVAILABLE->value;

                $tool = Tool::create([
                    'tool_code' => $this->generateToolCode($category),
                    'name' => $item['merk'],
                    'stock' => 1,
                    'note' => $item['note'],
                    'status' => $status,
                    'inventory_type' => InventoryTypeEnum::INTERNAL->value,
                    'category_id' => $category->id,
                    'location_id' => $kembar->id,
                    'used_by' => null,
                ]);

                $this->saveAttribute(
                    $tool,
                    $category,
                    'Tegangan',
                    $item['tegangan']
                );

                $this->saveAttribute(
                    $tool,
                    $category,
                    'Kabel Power',
                    $item['kabel_power']
                );
                $this->saveAttribute(
                    $tool,
                    $category,
                    'ID Lama Charger',
                    $item['id_lama']
                );
            });
        }
    }

    private function saveAttribute(
        Tool $tool,
        Category $category,
        string $fieldName,
        string $value
    ): void {
        $attribute = ToolAttribute::where('category_id', $category->id)
            ->where('field_name', $fieldName)
            ->firstOrFail();

        ToolAttributeValue::create([
            'value' => $value,
            'tool_id' => $tool->id,
            'tool_attribute_id' => $attribute->id,
        ]);
    }

    private function generateToolCode(Category $category): string
    {
        $prefix = strtoupper($category->slug);

        $lastTool = Tool::where('tool_code', 'like', $prefix . '-%')
            ->orderByDesc('tool_code')
            ->lockForUpdate()
            ->first();

        $lastNumber = $lastTool
            ? (int) substr($lastTool->tool_code, strlen($prefix) + 1)
            : 0;

        return $prefix . '-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }
}

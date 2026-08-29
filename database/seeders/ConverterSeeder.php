<?php

namespace Database\Seeders;

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\ToolAttribute;
use App\Models\ToolAttributeValue;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConverterSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::where('name', 'Converter')->firstOrFail();

        $kembar = Location::where('name', 'Kembar')
            ->whereNull('parent_id')
            ->firstOrFail();

        $rizki = User::where('email', 'muhamadrizkiaditya32@gmail.com')->first();
        $indra = User::where('email', 'indra@gmail.com')->first();
        $imam = User::where('email', 'imam@gmail.com')->first();
        $razzan = User::where('email', 'razzan@gmail.com')->first();

        $data = [
            ['id_lama' => '1', 'tipe' => 'HDMI to VGA', 'merk' => 'Vention', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '2', 'tipe' => 'HDMI to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '3', 'tipe' => 'HDMI to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => 'Dipake pak hans', 'kuantitas' => 1],
            ['id_lama' => '4', 'tipe' => 'HDMI to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '5', 'tipe' => 'Serial to VGA', 'merk' => 'Bafo', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '6', 'tipe' => 'VGA to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 2],
            ['id_lama' => '7', 'tipe' => 'USB C to VGA', 'merk' => 'NYK', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '8', 'tipe' => 'USB C OTG', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => 'Rusak', 'kuantitas' => 2],
            ['id_lama' => '9', 'tipe' => 'USB HUB', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '10', 'tipe' => 'DVI to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '11', 'tipe' => 'Mini HDMI to HDMI', 'merk' => 'Tanpa merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '12', 'tipe' => 'Micro USB to Port USB', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '13', 'tipe' => 'Apple Mini Display to VGA', 'merk' => 'tanpa merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '14', 'tipe' => 'Super Mini HDMI to VGA', 'merk' => 'vention', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '15', 'tipe' => 'USB Lightning to HDMI', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '16', 'tipe' => 'USB C to HDMI/VGA/C/USB Biasa', 'merk' => 'Tak Terbatas', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '17', 'tipe' => 'USB C to HDMI', 'merk' => 'Tak Terbatas', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '18', 'tipe' => 'HDMI to VGA', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '19', 'tipe' => 'HDMI to VGA', 'merk' => 'MT-VIKI', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '20', 'tipe' => 'Mini to HDMI', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '21', 'tipe' => 'Card Reader', 'merk' => 'Robot', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '22', 'tipe' => 'USB buat cek voltase', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '23', 'tipe' => 'M2 NVME/SATA Enclosure', 'merk' => 'Orico', 'usedBy' => null, 'note' => 'Tanpa kabel, kabelnya hilang', 'kuantitas' => 1],
            ['id_lama' => '24', 'tipe' => 'M2 NVME/SATA Enclosure', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => 'buat ngecek m2 sata udh gabisa cuman kedetek nvme aja, kabelnya cuman ada usb c to usb c.  biasanya klo mau ngecek suka pake kabel converter yg id lama nya 26', 'kuantitas' => 1],
            ['id_lama' => '25', 'tipe' => 'M2 Sata Enclosure', 'merk' => 'M-Tech', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],

            ['id_lama' => '26', 'tipe' => 'Apple Proprietary SSD Converter', 'merk' => 'Gaintech', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '27', 'tipe' => 'M-Sata to Sata', 'merk' => 'Tanpa Merk', 'usedBy' => null, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '28', 'tipe' => 'Casing HDD External', 'merk' => 'Tensincom', 'usedBy' => $imam->id, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '29', 'tipe' => 'Casing HDD External', 'merk' => 'Tensincom', 'usedBy' => $razzan->id, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '30', 'tipe' => 'Casing HDD External', 'merk' => 'Tanpa Merk', 'usedBy' => $indra->id, 'note' => null, 'kuantitas' => 1],
            ['id_lama' => '31', 'tipe' => 'Casing HDD External', 'merk' => 'Orico', 'usedBy' => $rizki->id, 'note' => null, 'kuantitas' => 1],
        ];

        foreach ($data as $item) {
            DB::transaction(function () use ($item, $category, $kembar) {
                $tool = Tool::create([
                    'tool_code' => $this->generateToolCode($category),
                    'name' => $item['merk'] . ' - ' . $item['tipe'],
                    'stock' => $item['kuantitas'],
                    'note' => $item['note'],
                    'status' => ToolEnum::AVAILABLE->value,
                    'inventory_type' => InventoryTypeEnum::INTERNAL->value,
                    'category_id' => $category->id,
                    'location_id' => $kembar->id,
                    'used_by' => $item['usedBy'],
                ]);

                $this->saveAttribute(
                    $tool,
                    $category,
                    'Tipe Converter',
                    $item['tipe']
                );
                $this->saveAttribute(
                    $tool,
                    $category,
                    'ID Lama Converter',
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

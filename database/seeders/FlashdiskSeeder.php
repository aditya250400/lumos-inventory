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

class FlashdiskSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::where('name', 'Flashdisk')->firstOrFail();

        $kembar = Location::where('name', 'Kembar')
            ->whereNull('parent_id')
            ->firstOrFail();

        $data = [
            ['kode' => 'A', 'merk' => 'Sandisk Cruzer Glide', 'kapasitas' => '32GB', 'digunakan_untuk' => 'Windows 11 GPT Non TPM', 'note' => null],
            ['kode' => 'B', 'merk' => 'Sandisk Cruzer Glide', 'kapasitas' => '32GB', 'digunakan_untuk' => 'Windows 11 GPT TPM', 'note' => null],
            ['kode' => 'C', 'merk' => 'Sandisk Ultra Flair', 'kapasitas' => '32GB', 'digunakan_untuk' => 'Windows 10 GPT', 'note' => null],
            ['kode' => 'D', 'merk' => 'Sandisk Ultra Flair', 'kapasitas' => '16GB', 'digunakan_untuk' => 'Windows 10 MBR', 'note' => null],
            ['kode' => 'E', 'merk' => 'Sandisk Cruzer Blade', 'kapasitas' => '8GB', 'digunakan_untuk' => 'Windows 10 Lite GPT', 'note' => null],
            ['kode' => 'F', 'merk' => 'Toshiba Puti', 'kapasitas' => '16GB', 'digunakan_untuk' => 'Windows 10 Lite MBR', 'note' => null],
            ['kode' => 'G', 'merk' => 'Sandisk Cruzer Blade', 'kapasitas' => '8GB', 'digunakan_untuk' => 'Windows 8.1 GPT', 'note' => null],
            ['kode' => 'H', 'merk' => 'DT101-G2', 'kapasitas' => '8GB', 'digunakan_untuk' => 'Windows 8.1 MBR', 'note' => null],
            ['kode' => 'I', 'merk' => 'Trascend Putih', 'kapasitas' => '8GB', 'digunakan_untuk' => 'Windows 7 GPT', 'note' => null],
            ['kode' => 'J', 'merk' => 'Kogene Biotech', 'kapasitas' => '8GB', 'digunakan_untuk' => 'Windows 7 MBR', 'note' => null],
            ['kode' => 'K', 'merk' => 'Lexar', 'kapasitas' => '1GB', 'digunakan_untuk' => 'Memtest GPT', 'note' => 'Udah rusak'],
            ['kode' => 'L', 'merk' => 'Data Traveler', 'kapasitas' => '1GB', 'digunakan_untuk' => 'Awalnya buat memtest mbr cuman sekarang dipake buat ambil absen', 'note' => null],
            ['kode' => 'M', 'merk' => 'Sandisk Cruzer Blade', 'kapasitas' => '4GB', 'digunakan_untuk' => 'ANHDV GPT', 'note' => null],
            ['kode' => 'N', 'merk' => 'Kingston DT CNY 12Dragon', 'kapasitas' => '8GB', 'digunakan_untuk' => 'ANHDV MBR', 'note' => null],
            ['kode' => 'O', 'merk' => 'Sandisk Ultra 3.0', 'kapasitas' => '32GB', 'digunakan_untuk' => 'MacOS (Big sur dan Monterey)', 'note' => null],
            ['kode' => 'P', 'merk' => 'Sandisk Ultra 3.0', 'kapasitas' => '32GB', 'digunakan_untuk' => 'MacOS (High Sierra, Mojave, Catalina)', 'note' => 'Ga kedetek udah rusak'],
            ['kode' => 'Q', 'merk' => 'Sandisk Cruzer Glide', 'kapasitas' => '64GB', 'digunakan_untuk' => 'MacOS High Sierra', 'note' => null],
            ['kode' => 'R', 'merk' => 'Sandisk Cruzer Glide 3.0', 'kapasitas' => '32GB', 'digunakan_untuk' => 'Apapun 1', 'note' => null],
            ['kode' => 'S', 'merk' => 'Sandisk Cruzer Glide 3.0', 'kapasitas' => '32GB', 'digunakan_untuk' => 'Awalnya apapun 2 tapi diubah jadi MultiBoot', 'note' => 'Jangan dihapus'],
        ];

        foreach ($data as $item) {
            DB::transaction(function () use ($item, $category, $kembar) {
                $status = $item['note'] !== null
                    && preg_match('/\brusak\b/i', $item['note'])
                    ? ToolEnum::DAMAGE->value
                    : ToolEnum::AVAILABLE->value;

                $tool = Tool::create([
                    'tool_code' => $this->generateToolCode($category),
                    'name' => $item['merk'] . ' ' . $item['kapasitas'],
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
                    'Kapasitas',
                    $item['kapasitas']
                );

                $this->saveAttribute(
                    $tool,
                    $category,
                    'Digunakan Untuk',
                    $item['digunakan_untuk']
                );

                $this->saveAttribute(
                    $tool,
                    $category,
                    'Kode Lama',
                    $item['kode']
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

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

class StorageSeeder extends Seeder
{
    public function run(): void
    {
        $kembar = Location::where('name', 'Kembar')
            ->whereNull('parent_id')
            ->firstOrFail();

        $rizki = User::where('email', 'muhamadrizkiaditya32@gmail.com')->first();
        $indra = User::where('email', 'indra@gmail.com')->first();
        $imam = User::where('email', 'imam@gmail.com')->first();
        $razzan = User::where('email', 'razzan@gmail.com')->first();

        $data = [
            [
                'jenis' => 'Harddisk',
                'id_lama' => '2',
                'merk' => 'Toshiba 320GB',
                'tipe' => '2.5inch Sata',
                'kapasitas' => '320GB',
                'serial' => 'MK3259GSXP',
                'health' => "Sentinel : 28%\nCrystalDisk : Caution",
                'digunakan_untuk' => "Cadangan Aja klo hdd\nexternal yg lain ada yg\nmasalah. bisa juga di isi\nwindows buat tester",
                'used_by' => null,
                'note' => "Isinya standarisasi,\niso files, game,dll, udah rusak, barang ada dikumpulan hdd/ssd rusak karna health nya udah jelek",
            ],

            [
                'jenis' => 'Harddisk',
                'id_lama' => '3',
                'merk' => 'Seagate 160GB',
                'tipe' => '2.5inch Sata',
                'kapasitas' => '160GB',
                'serial' => '5XT0JVR1',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => $indra?->id,
                'note' => 'udah rusak, tiap copy data selalu kecil transfer rate nya, udah rusak, barang ada dikumpulan hdd/ssd rusak',
            ],

            [
                'jenis' => 'Harddisk',
                'id_lama' => '4',
                'merk' => 'Samsung 250GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '250GB',
                'serial' => 'S1YKJAOSC97241',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => $rizki?->id,
                'note' => 'ini gatau kemana saya lupa nyimpen, klo gasalah ini juga udah rusak sih',
            ],

            [
                'jenis' => 'Harddisk',
                'id_lama' => '5',
                'merk' => 'Toshiba 500GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '500GB',
                'serial' => '17UXC50IT',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => $imam?->id,
                'note' => null,
            ],

            [
                'jenis' => 'Harddisk',
                'id_lama' => '6',
                'merk' => 'Samsung 1TB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '1TB',
                'serial' => 'HN-M101MBB/AS1',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Master',
                'used_by' => $rizki->id,
                'note' => "Awalnya buat Backup Data User tapi sekarang udah dipake jadi hdd master dipake rizki",
            ],

            [
                'jenis' => 'Harddisk',
                'id_lama' => '7',
                'merk' => 'Seagate Expansion 2TB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '2TB',
                'serial' => 'NAAQJC7C',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Backup Data User',
                'used_by' => null,
                'note' => 'Banyak data user dihapus 3 bulan sekali',
            ],
            [
                'jenis' => 'Harddisk',
                'id_lama' => '12',
                'merk' => 'HGST 500GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '500GB',
                'serial' => '-',
                'health' => "Sentinel : 96%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => null,
                'note' => 'udah rusak',
            ],
            [
                'jenis' => 'Harddisk',
                'id_lama' => '13',
                'merk' => 'WD Blue 500GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '500GB',
                'serial' => 'WD500BPVT',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Backup Data User',
                'used_by' => null,
                'note' => 'Cabutan dari laptop ko ganda',
            ],
            [
                'jenis' => 'Harddisk',
                'id_lama' => '14',
                'merk' => 'WD Blue 1TB',
                'tipe' => '3.5Inch Sata',
                'kapasitas' => '1TB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Master Standarisai',
                'used_by' => null,
                'note' => 'Udah Rusak',
            ],
            [
                'jenis' => 'Harddisk',
                'id_lama' => '15',
                'merk' => 'WD Blue 500GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '500GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => $razzan->id,
                'note' => 'Masih dipake',
            ],
            [
                'jenis' => 'Harddisk',
                'id_lama' => '16',
                'merk' => 'Seagate 500GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '500GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Standarisasi',
                'used_by' => $indra->id,
                'note' => 'Masih dipake',
            ],

            // SSD

            [
                'jenis' => 'SSD',
                'id_lama' => '8',
                'merk' => 'Kingfast 128GB',
                'tipe' => '2.5Inch Sata',
                'kapasitas' => '128GB',
                'serial' => 'NAG3924Gj0496',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Tester Windows 10 MBR',
                'used_by' => null,
                'note' => 'Udah rusak, barang ada di kumpulan hdd/ssd rusak',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '9',
                'merk' => 'Midasforce 128GB',
                'tipe' => 'M2 Sata',
                'kapasitas' => '128GB',
                'serial' => 'M2H603012812210251',
                'health' => "Sentinel : 100%\nCrystalDisk : Good",
                'digunakan_untuk' => 'Tester Windows 10 GPT',
                'used_by' => null,
                'note' => 'Hilang barangnya',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '10',
                'merk' => 'Colorful 128GB',
                'tipe' => 'NVME Gen 3',
                'kapasitas' => '128GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Tester Windows',
                'used_by' => null,
                'note' => 'Udah rusak',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '11',
                'merk' => 'Midasforce 120GB',
                'tipe' => '2.5 Sata',
                'kapasitas' => '120GB',
                'serial' => 'MFSL01201121685',
                'health' => "-",
                'digunakan_untuk' => 'Tester Windows',
                'used_by' => null,
                'note' => 'Udah rusak, barang ada di kumpulan hdd/ssd rusak',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '17',
                'merk' => 'Toshiba 128GB',
                'tipe' => 'M.2 Sata',
                'kapasitas' => '128GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Tester OS',
                'used_by' => null,
                'note' => 'Udah rusak',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '18',
                'merk' => 'Union Memory 256GB',
                'tipe' => 'Mini NVME',
                'kapasitas' => '256GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Tester OS',
                'used_by' => null,
                'note' => 'Udah rusak',
            ],

            [
                'jenis' => 'SSD',
                'id_lama' => '19',
                'merk' => 'Pioneer 120GB',
                'tipe' => '2.5 Sata',
                'kapasitas' => '120GB',
                'serial' => '-',
                'health' => "-",
                'digunakan_untuk' => 'Tester OS',
                'used_by' => null,
                'note' => 'Udah rusak',
            ],
        ];

        foreach ($data as $item) {
            DB::transaction(function () use ($item, $kembar) {
                $category = Category::where('name', $item['jenis'])->firstOrFail();

                $status = $this->isDamaged($item['note'])
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
                    'used_by' => $item['used_by'],
                ]);

                $attributes = [
                    'Tipe Storage' => $item['tipe'],
                    'Kapasitas' => $item['kapasitas'],
                    'Serial Number' => $item['serial'],
                    'Health' => $item['health'],
                    'Digunakan Untuk' => $item['digunakan_untuk'],
                    'ID Lama Storage' => $item['id_lama'],
                ];

                $this->saveAttributes($tool, $category, $attributes);
            });
        }
    }

    private function isDamaged(?string $note): bool
    {
        return $note !== null
            && preg_match('/\brusak\b/i', $note) === 1;
    }

    private function saveAttributes(
        Tool $tool,
        Category $category,
        array $attributes
    ): void {
        foreach ($attributes as $fieldName => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $attribute = ToolAttribute::where('category_id', $category->id)
                ->where('field_name', $fieldName)
                ->first();

            if (!$attribute) {
                continue;
            }

            ToolAttributeValue::create([
                'value' => $value,
                'tool_id' => $tool->id,
                'tool_attribute_id' => $attribute->id,
            ]);
        }
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

        return $prefix . '-' . str_pad(
            $lastNumber + 1,
            6,
            '0',
            STR_PAD_LEFT
        );
    }
}

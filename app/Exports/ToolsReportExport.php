<?php

namespace App\Exports;

use App\Models\Tool;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;



class ToolsReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private readonly ?array $locationIds,
        private readonly ?string $categoryId,
    ) {}

    public function collection()
    {
        return Tool::query()
            ->when($this->locationIds, fn($q) => $q->whereIn('location_id', $this->locationIds))
            ->when($this->categoryId, fn($q, $v) => $q->where('category_id', $v))
            ->with(['category', 'location.parent', 'usedBy'])
            ->orderBy('name')
            ->get();
    }

    public function headings(): array
    {
        return ['Kode', 'Nama Tools', 'Kategori', 'Lokasi', 'Status', 'Jenis Tool', 'Dipakai oleh', 'Stok'];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '4472C4'],
                ],
                'alignment' => [
                    'horizontal' => 'center',
                    'vertical' => 'center',
                ],
            ],
        ];
    }


    public function map($tool): array
    {
        return [
            $tool->tool_code,
            $tool->name,
            $tool->category->name,
            $tool->location->parent
                ? "{$tool->location->name} ({$tool->location->parent->name})"
                : $tool->location->name,
            $tool->status,
            $tool->inventory_type,
            $tool->usedBy?->name ?? 'Semua Staff',
            $tool->stock,
        ];
    }
}

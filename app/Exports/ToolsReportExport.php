<?php

namespace App\Exports;

use App\Models\Tool;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ToolsReportExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithEvents,
    WithStyles,
    ShouldAutoSize
{
    /**
     * Row 1 = Judul
     * Row 2 = Filter
     * Row 3 = Summary label
     * Row 4 = Summary value
     * Row 5 = Spacer
     * Row 6 = Header tabel
     * Row 7+ = Data
     */
    private const SUMMARY_ROWS = 5;

    private const HEADER_ROW = 6;

    public function __construct(
        private readonly ?array $locationIds,
        private readonly array $filters,
        private readonly ?string $categoryId,
        private readonly array $filterLabels,
        private readonly int $totalTools,
        private readonly int $totalStock,
    ) {}

    public function collection()
    {
        return Tool::query()
            ->filters($this->filters)
            ->when(
                $this->locationIds,
                fn($q) => $q->whereIn('location_id', $this->locationIds)
            )
            ->when(
                $this->categoryId,
                fn($q, $v) => $q->where('category_id', $v)
            )
            ->with([
                'category',
                'location.parent',
                'usedBy',
            ])
            ->orderBy('name')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Kode',
            'Nama Tools',
            'Kategori',
            'Lokasi',
            'Status',
            'Jenis Tool',
            'Dipakai Oleh',
            'Stok',
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

    /**
     * Styling utama dilakukan di AfterSheet
     * setelah row summary ditambahkan.
     */
    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // =====================================================
                // TAMBAH 5 ROW UNTUK SUMMARY
                // =====================================================

                $sheet->insertNewRowBefore(1, self::SUMMARY_ROWS);

                // =====================================================
                // MERGE SUMMARY
                // =====================================================

                // Judul
                $sheet->mergeCells('A1:H1');

                // Filter
                $sheet->mergeCells('A2:H2');

                // Total Tools
                $sheet->mergeCells('A3:D3');
                $sheet->mergeCells('A4:D4');

                // Total Stok
                $sheet->mergeCells('E3:H3');
                $sheet->mergeCells('E4:H4');

                // =====================================================
                // JUDUL
                // =====================================================

                $sheet->setCellValue(
                    'A1',
                    'LAPORAN TOOLS'
                );

                $sheet->getStyle('A1:H1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                        'color' => [
                            'rgb' => '1F2937',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // =====================================================
                // FILTER
                // =====================================================

                $filterText = collect($this->filterLabels)
                    ->map(
                        fn($value, $label) =>
                        "{$label}: {$value}"
                    )
                    ->implode('   •   ');

                $sheet->setCellValue(
                    'A2',
                    $filterText
                );

                $sheet->getStyle('A2:H2')->applyFromArray([
                    'font' => [
                        'size' => 10,
                        'color' => [
                            'rgb' => '6B7280',
                        ],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'F3F4F6',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true,
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => 'E5E7EB',
                            ],
                        ],
                    ],
                ]);

                // =====================================================
                // SUMMARY
                // =====================================================

                $sheet->setCellValue(
                    'A3',
                    'Total Tools'
                );

                $sheet->setCellValue(
                    'A4',
                    number_format($this->totalTools)
                );

                $sheet->setCellValue(
                    'E3',
                    'Total Stok'
                );

                $sheet->setCellValue(
                    'E4',
                    number_format($this->totalStock)
                );

                // =====================================================
                // SUMMARY - TOTAL TOOLS
                // =====================================================

                $sheet->getStyle('A3:D4')->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'EFF6FF',
                        ],
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => 'BFDBFE',
                            ],
                        ],
                    ],
                ]);

                // =====================================================
                // SUMMARY - TOTAL STOK
                // =====================================================

                $sheet->getStyle('E3:H4')->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'ECFDF5',
                        ],
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => 'A7F3D0',
                            ],
                        ],
                    ],
                ]);

                // =====================================================
                // SUMMARY LABEL
                // =====================================================

                $sheet->getStyle('A3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                        'color' => [
                            'rgb' => '2563EB',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle('E3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                        'color' => [
                            'rgb' => '047857',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // =====================================================
                // SUMMARY VALUE
                // =====================================================

                $sheet->getStyle('A4')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                        'color' => [
                            'rgb' => '1D4ED8',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getStyle('E4')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 16,
                        'color' => [
                            'rgb' => '047857',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // =====================================================
                // HEADER TABEL
                // =====================================================

                // PENTING:
                // Header tabel berada di A6:H6 setelah insert 5 row.
                $sheet->getStyle('A6:H6')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 10,
                        'color' => [
                            'rgb' => 'FFFFFF',
                        ],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => '4472C4',
                        ],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => 'B4C7E7',
                            ],
                        ],
                    ],
                ]);

                // =====================================================
                // ROW HEIGHT
                // =====================================================

                $sheet->getRowDimension(1)->setRowHeight(28);
                $sheet->getRowDimension(2)->setRowHeight(28);
                $sheet->getRowDimension(3)->setRowHeight(20);
                $sheet->getRowDimension(4)->setRowHeight(28);
                $sheet->getRowDimension(5)->setRowHeight(8);
                $sheet->getRowDimension(6)->setRowHeight(25);

                // =====================================================
                // AUTO WIDTH
                // =====================================================

                foreach (range('A', 'H') as $column) {
                    $sheet
                        ->getColumnDimension($column)
                        ->setAutoSize(true);
                }

                // =====================================================
                // DATA
                // =====================================================

                $highestRow = $sheet->getHighestRow();

                if ($highestRow > self::HEADER_ROW) {
                    $dataStartRow = self::HEADER_ROW + 1;

                    $dataRange = "A{$dataStartRow}:H{$highestRow}";

                    $sheet->getStyle($dataRange)->applyFromArray([
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                    // Kode
                    $sheet
                        ->getStyle("A{$dataStartRow}:A{$highestRow}")
                        ->getAlignment()
                        ->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );

                    // Stok
                    $sheet
                        ->getStyle("H{$dataStartRow}:H{$highestRow}")
                        ->getAlignment()
                        ->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );
                }

                // =====================================================
                // FREEZE HEADER
                // =====================================================

                $sheet->freezePane('A7');

                // =====================================================
                // AUTO FILTER
                // =====================================================

                $sheet->setAutoFilter(
                    "A6:H{$highestRow}"
                );
            },
        ];
    }
}

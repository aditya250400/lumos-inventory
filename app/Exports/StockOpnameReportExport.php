<?php

namespace App\Exports;

use App\Models\StockOpname;
use Illuminate\Support\Collection;
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

class StockOpnameReportExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithEvents,
    WithStyles,
    ShouldAutoSize
{
    private const SUMMARY_ROWS = 5;
    private const HEADER_ROW = 6;

    private Collection $stockOpnames;

    private int $totalDetails = 0;
    private int $totalMismatch = 0;

    public function __construct(
        private readonly array $filters,
        private readonly ?array $locationIds,
        private readonly array $filterLabels = [],
    ) {
        $this->stockOpnames = collect();
    }

    public function collection(): Collection
    {
        $this->stockOpnames = StockOpname::query()
            ->filters($this->filters)
            ->when(
                $this->locationIds,
                fn($q) => $q->whereIn('location_id', $this->locationIds)
            )
            ->withCount([
                'details as mismatch_count' => fn($q) =>
                $q->where('status', 'Tidak Sesuai'),
            ])
            ->with([
                'location',
                'createdBy',
                'details.tool',
            ])
            ->orderByDesc('mismatch_count')
            ->orderByDesc('created_at')
            ->get();

        $rows = collect();

        foreach ($this->stockOpnames as $stockOpname) {
            $details = $stockOpname->details
                ->sortBy(
                    fn($detail) =>
                    $detail->status === 'Tidak Sesuai' ? 0 : 1
                );

            foreach ($details as $detail) {
                $this->totalDetails++;

                if ($detail->status === 'Tidak Sesuai') {
                    $this->totalMismatch++;
                }

                $rows->push([
                    'stock_opname' => $stockOpname,
                    'detail' => $detail,
                ]);
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Sesi',
            'Tanggal',
            'Lokasi',
            'Dibuat Oleh',
            'Kode Tool',
            'Nama Tool',
            'Stok Sistem',
            'Stok Fisik',
            'Status',
            'Alasan Selisih',
        ];
    }

    public function map($row): array
    {
        $stockOpname = $row['stock_opname'];
        $detail = $row['detail'];

        return [
            "#{$stockOpname->id}",
            $stockOpname->created_at,
            $stockOpname->location?->name ?? '-',
            $stockOpname->createdBy?->name ?? '-',
            $detail->tool?->tool_code ?? '-',
            $detail->tool?->name ?? '-',
            $detail->system_stock,
            $detail->physical_stock,
            $detail->status,
            $detail->discrepancy_reason ?? '-',
        ];
    }

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
                // INSERT SUMMARY ROW
                // =====================================================

                $sheet->insertNewRowBefore(
                    1,
                    self::SUMMARY_ROWS
                );

                // =====================================================
                // MERGE CELLS
                // =====================================================

                $sheet->mergeCells('A1:J1');
                $sheet->mergeCells('A2:J2');

                $sheet->mergeCells('A3:C3');
                $sheet->mergeCells('A4:C4');

                $sheet->mergeCells('D3:F3');
                $sheet->mergeCells('D4:F4');

                $sheet->mergeCells('G3:J3');
                $sheet->mergeCells('G4:J4');

                // =====================================================
                // JUDUL
                // =====================================================

                $sheet->setCellValue(
                    'A1',
                    'LAPORAN STOCK OPNAME'
                );

                $sheet->getStyle('A1:J1')->applyFromArray([
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
                    $filterText ?: 'Semua Data'
                );

                $sheet->getStyle('A2:J2')->applyFromArray([
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

                $sheet->setCellValue('A3', 'Total Sesi');
                $sheet->setCellValue(
                    'A4',
                    number_format($this->stockOpnames->count())
                );

                $sheet->setCellValue('D3', 'Total Detail');
                $sheet->setCellValue(
                    'D4',
                    number_format($this->totalDetails)
                );

                $sheet->setCellValue('G3', 'Total Tidak Sesuai');
                $sheet->setCellValue(
                    'G4',
                    number_format($this->totalMismatch)
                );

                // =====================================================
                // SUMMARY BACKGROUND
                // =====================================================

                $sheet->getStyle('A3:C4')->applyFromArray([
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

                $sheet->getStyle('D3:F4')->applyFromArray([
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

                $sheet->getStyle('G3:J4')->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => 'FEF2F2',
                        ],
                    ],
                    'borders' => [
                        'outline' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => [
                                'rgb' => 'FECACA',
                            ],
                        ],
                    ],
                ]);

                // =====================================================
                // SUMMARY LABEL
                // =====================================================

                foreach (
                    [
                        'A3' => '2563EB',
                        'D3' => '047857',
                        'G3' => 'DC2626',
                    ] as $cell => $color
                ) {
                    $sheet->getStyle($cell)->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'size' => 10,
                            'color' => [
                                'rgb' => $color,
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);
                }

                // =====================================================
                // SUMMARY VALUE
                // =====================================================

                foreach (
                    [
                        'A4' => '1D4ED8',
                        'D4' => '047857',
                        'G4' => 'DC2626',
                    ] as $cell => $color
                ) {
                    $sheet->getStyle($cell)->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'size' => 16,
                            'color' => [
                                'rgb' => $color,
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);
                }

                // =====================================================
                // HEADER TABEL
                // =====================================================

                $sheet->getStyle('A6:J6')->applyFromArray([
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

                foreach (range('A', 'J') as $column) {
                    $sheet
                        ->getColumnDimension($column)
                        ->setAutoSize(true);
                }

                // =====================================================
                // DATA STYLE
                // =====================================================

                $highestRow = $sheet->getHighestRow();

                if ($highestRow > self::HEADER_ROW) {
                    $dataStartRow = self::HEADER_ROW + 1;

                    $dataRange = "A{$dataStartRow}:J{$highestRow}";

                    $sheet->getStyle($dataRange)->applyFromArray([
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                    // Sesi
                    $sheet
                        ->getStyle("A{$dataStartRow}:A{$highestRow}")
                        ->getAlignment()
                        ->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );

                    // Tanggal
                    $sheet
                        ->getStyle("B{$dataStartRow}:B{$highestRow}")
                        ->getNumberFormat()
                        ->setFormatCode('dd/mm/yyyy hh:mm');

                    // Stok Sistem dan Fisik
                    $sheet
                        ->getStyle("G{$dataStartRow}:H{$highestRow}")
                        ->getAlignment()
                        ->setHorizontal(
                            Alignment::HORIZONTAL_CENTER
                        );

                    // Status
                    $sheet
                        ->getStyle("I{$dataStartRow}:I{$highestRow}")
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
                    "A6:J{$highestRow}"
                );
            },
        ];
    }
}

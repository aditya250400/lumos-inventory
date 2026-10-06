<?php

namespace App\Exports;

use App\Models\StockOpname;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StockOpnameReportExport implements FromCollection, WithHeadings
{
    public function __construct(
        private readonly ?array $locationIds,
        private readonly ?string $dateFrom,
        private readonly ?string $dateTo,
    ) {}

    public function collection(): Collection
    {
        $stockOpnames = StockOpname::query()
            ->when($this->locationIds, fn($q) => $q->whereIn('location_id', $this->locationIds))
            ->when($this->dateFrom, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($this->dateTo, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->withCount(['details as mismatch_count' => fn($q) => $q->where('status', 'Tidak Sesuai')])
            ->with(['location', 'createdBy', 'details.tool'])
            ->orderByDesc('mismatch_count')
            ->orderByDesc('created_at')
            ->get();

        $rows = collect();

        foreach ($stockOpnames as $stockOpname) {
            $details = $stockOpname->details->sortBy(fn($d) => $d->status === 'Tidak Sesuai' ? 0 : 1);

            foreach ($details as $detail) {
                $rows->push([
                    "#{$stockOpname->id}",
                    $stockOpname->created_at,
                    $stockOpname->location->name,
                    $stockOpname->createdBy->name,
                    $detail->tool->tool_code,
                    $detail->tool->name,
                    $detail->system_stock,
                    $detail->physical_stock,
                    $detail->status,
                    $detail->discrepancy_reason ?? '-',
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
}

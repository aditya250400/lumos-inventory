<?php

namespace App\Http\Controllers;

use App\Enums\DiscrepancyReasonEnum;
use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Exports\StockOpnameReportExport;
use App\Exports\ToolsReportExport;
use App\Http\Resources\StockOpnameResource;
use App\Http\Resources\ToolsResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\StockOpname;
use App\Models\Tool;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'tools');

        $locations = Location::select(['id', 'name', 'slug', 'parent_id'])
            ->with('parent:id,name')
            ->withCount('children')
            ->orderBy('name')
            ->get();

        $state = [
            'type' => $type,
            'location_id' => $request->input('location_id', ''),
            'category_id' => $request->input('category_id', ''),
            'created_by' => request()->input('created_by', ''),
            'date_from' => $request->input('date_from', ''),
            'date_to' => $request->input('date_to', ''),
            'load' => $request->input('load', 50),
            'page' => $request->input('page', 1),
            'category' => request()->input('category', ''),
            'location' => request()->input('location', ''),
            'status' => request()->input('status', ''),
            'inventory_type' => request()->input('inventory_type', ''),
            'used_by' => request()->input('used_by', ''),
        ];

        if ($type === 'stock-opnames') {
            return $this->stockOpnameReport($request, $locations, $state);
        }

        return $this->toolsReport($request, $locations, $state);
    }

    private function toolsReport(Request $request, $locations, array $state)
    {
        $locationIds = $this->resolveLocationIds($request->input('location'));

        $base = Tool::query()
            ->filters($request->only(['category', 'status', 'inventory_type', 'used_by']))
            ->sorting(request()->only(['field', 'direction']))
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('category_id'), fn($q, $v) => $q->where('category_id', $v));

        $tools = (clone $base)
            ->with(['category', 'location.parent', 'usedBy'])
            ->orderBy('name')
            ->paginate($request->input('load', 15));

        return inertia('Reports/Index', [
            'page_settings' => ['title' => 'Laporan', 'subtitle' => 'Pilih jenis laporan, lalu sesuaikan filternya'],
            'report_type' => 'tools',
            'locations' => $locations,
            'categories' => Category::select('id', 'name', 'slug')->orderBy('name')->get(),
            'users' => User::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'statuses' => ToolEnum::options(),
            'inventory_types' => InventoryTypeEnum::options(),
            'tools' => ToolsResource::collection($tools)->additional([
                'meta' => ['has_pages' => $tools->hasPages()],
            ]),
            'summary' => [
                'total_tools' => (clone $base)->count(),
                'total_stock' => (clone $base)->sum('stock'),
            ],
            'state' => $state,
        ]);
    }

    private function stockOpnameReport(Request $request, $locations, array $state)
    {
        $locationIds = $this->resolveLocationIds($request->input('location'));

        $stockOpnames = StockOpname::query()
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->filters(request()->only([
                'location',
                'created_by',
                'date_from',
                'date_to',
            ]))
            ->withCount([
                'details as mismatch_count' => fn($q) => $q->where('status', 'Tidak Sesuai'),
                'details as difference_count' => function ($query) {
                    $query->whereColumn('system_stock', '!=', 'physical_stock');
                }

            ])
            ->with(['location', 'createdBy', 'details.tool'])
            ->paginate(request()->input('load', 10));

        return inertia('Reports/Index', [
            'page_settings' => ['title' => 'Laporan', 'subtitle' => 'Pilih jenis laporan, lalu sesuaikan filternya'],
            'report_type' => 'stock-opnames',
            'locations' => $locations,
            'stockOpnames' => StockOpnameResource::collection($stockOpnames)->additional([
                'meta' => [
                    'has_pages' => $stockOpnames->hasPages(),
                ],
            ]),
            'summary' => [
                'session_count' => StockOpname::count(),
                'total_checked' => $stockOpnames->sum(fn($so) => $so->details->count()),
                'total_mismatch' => $stockOpnames->sum('mismatch_count'),
            ],
            'users' => User::query()
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
            'discrepancy_reasons' => DiscrepancyReasonEnum::options(),
            'state' => $state,
        ]);
    }

    public function exportToolsExcel(Request $request)
    {

        $locationIds = $this->resolveLocationIds($request->input('location'));
        $filters = $request->only(['category', 'status', 'inventory_type', 'used_by']);

        $base = Tool::query()
            ->filters($filters)
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('category_id'), fn($q, $v) => $q->where('category_id', $v));

        return Excel::download(
            new ToolsReportExport(
                $locationIds,
                $filters,
                $request->input('category_id'),
                $this->buildFilterToolLabels($request),
                (clone $base)->count(),
                (int) (clone $base)->sum('stock'),
            ),
            'laporan-tools-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportStockOpnamesExcel(Request $request)
    {


        $locationIds = $this->resolveLocationIds($request->input('location'));
        $filters = $request->only(['location', 'date_from', 'date_to', 'created_by']);

        return Excel::download(
            new StockOpnameReportExport($filters, $locationIds, $this->buildStockOpnameFilterLabels($request),),
            'laporan-stock-opname-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportStockOpnamesPdf(Request $request)
    {
        $locationIds = $this->resolveLocationIds($request->input('location'));

        $stockOpnames = StockOpname::query()
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('date_from'), fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->input('date_to'), fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->withCount(['details as mismatch_count' => fn($q) => $q->where('status', 'Tidak Sesuai')])
            ->with(['location', 'createdBy', 'details.tool'])
            ->orderByDesc('mismatch_count')
            ->orderByDesc('created_at')
            ->get();

        $groups = $stockOpnames->map(fn($so) => $this->formatStockOpnameGroup($so));

        $pdf = Pdf::loadView('reports.stock-opname-pdf', ['groups' => $groups]);

        return $pdf->download('laporan-stock-opname-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Kalau location_id yang difilter adalah lokasi induk, ikutan sertakan semua
     * id sub-lokasinya (konsisten sama behavior filter lokasi di halaman lain).
     */
    private function resolveLocationIds(?string $locationSlug): ?array
    {
        if (!$locationSlug) {
            return null;
        }

        $location = Location::where('slug', $locationSlug)->first();

        if (!$location) {
            return null;
        }


        return collect([$location->id])
            ->merge($location->children()->pluck('id'))
            ->all();
    }
    private function buildFilterToolLabels(Request $request): array
    {
        $location = $request->input('location')
            ? Location::where('slug', $request->input('location'))->first()
            : null;

        $category = $request->input('category_id')
            ? Category::find($request->input('category_id'))
            : null;

        $usedBy = $request->input('used_by')
            ? User::find($request->input('used_by'))
            : null;

        return [
            'Lokasi' => $location?->name ?? 'Semua Lokasi',
            'Kategori' => $category?->name ?? 'Semua Kategori',
            'Status' => $request->input('status') ?: 'Semua Status',
            'Tipe' => $request->input('inventory_type') ?: 'Semua Tipe',
            'Dipakai Oleh' => $usedBy->name ?? 'Semua Staff',
        ];
    }

    private function buildStockOpnameFilterLabels(Request $request): array
    {
        // Mengambil nama lokasi berdasarkan slug.
        $location = $request->input('location')
            ? Location::where(
                'slug',
                $request->input('location')
            )->first()
            : null;

        // Mengambil nama pembuat sesi Stock Opname.
        $createdBy = $request->input('created_by')
            ? User::find($request->input('created_by'))
            : null;

        // Mengambil tanggal filter.
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        return [
            'Lokasi' => $location?->name ?? 'Semua Lokasi',

            'Dibuat Oleh' => $createdBy?->name ?? 'Semua Staff',

            'Tanggal Mulai' => $dateFrom
                ? date('d/m/Y', strtotime($dateFrom))
                : 'Semua Tanggal',

            'Tanggal Akhir' => $dateTo
                ? date('d/m/Y', strtotime($dateTo))
                : 'Semua Tanggal',
        ];
    }


    private function formatStockOpnameGroup(StockOpname $stockOpname): array
    {
        // Row yang "Tidak Sesuai" ditaruh di atas dalam 1 sesi yang sama
        $details = $stockOpname->details
            ->sortBy(fn($d) => $d->status === 'Tidak Sesuai' ? 0 : 1)
            ->values();

        return [
            'id' => $stockOpname->id,
            'created_at' => $stockOpname->created_at,
            'location' => $stockOpname->location->name,
            'created_by' => $stockOpname->createdBy->name,
            'mismatch_count' => $stockOpname->mismatch_count,
            'details' => $details->map(fn($d) => [
                'tool_code' => $d->tool->tool_code,
                'tool_name' => $d->tool->name,
                'system_stock' => $d->system_stock,
                'physical_stock' => $d->physical_stock,
                'status' => $d->status,
                'discrepancy_reason' => $d->discrepancy_reason,
            ]),
        ];
    }
}

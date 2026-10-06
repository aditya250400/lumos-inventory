<?php

namespace App\Http\Controllers;

use App\Exports\StockOpnameReportExport;
use App\Exports\ToolsReportExport;
use App\Http\Resources\ToolsResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\StockOpname;
use App\Models\Tool;
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
            'date_from' => $request->input('date_from', ''),
            'date_to' => $request->input('date_to', ''),
            'load' => $request->input('load', 50),
            'page' => $request->input('page', 1),
        ];

        if ($type === 'stock-opnames') {
            return $this->stockOpnameReport($request, $locations, $state);
        }

        return $this->toolsReport($request, $locations, $state);
    }

    private function toolsReport(Request $request, $locations, array $state)
    {
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

        $base = Tool::query()
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('category_id'), fn($q, $v) => $q->where('category_id', $v));

        $tools = (clone $base)
            ->with(['category', 'location.parent', 'usedBy'])
            ->orderBy('name')
            ->paginate($request->input('load', 50));

        return inertia('Reports/Index', [
            'page_settings' => ['title' => 'Laporan', 'subtitle' => 'Pilih jenis laporan, lalu sesuaikan filternya'],
            'report_type' => 'tools',
            'locations' => $locations,
            'categories' => Category::select('id', 'name')->orderBy('name')->get(),
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
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

        $stockOpnames = StockOpname::query()
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('date_from'), fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->input('date_to'), fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->withCount(['details as mismatch_count' => fn($q) => $q->where('status', 'Tidak Sesuai')])
            ->with(['location', 'createdBy', 'details.tool'])
            ->orderByDesc('mismatch_count') // sesi yang ada selisih muncul duluan
            ->orderByDesc('created_at')
            ->get();

        return inertia('Reports/Index', [
            'page_settings' => ['title' => 'Laporan', 'subtitle' => 'Pilih jenis laporan, lalu sesuaikan filternya'],
            'report_type' => 'stock-opnames',
            'locations' => $locations,
            'groups' => $stockOpnames->map(fn($so) => $this->formatStockOpnameGroup($so)),
            'summary' => [
                'session_count' => $stockOpnames->count(),
                'total_checked' => $stockOpnames->sum(fn($so) => $so->details->count()),
                'total_mismatch' => $stockOpnames->sum('mismatch_count'),
            ],
            'state' => $state,
        ]);
    }

    public function exportToolsExcel(Request $request)
    {
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

        return Excel::download(
            new ToolsReportExport($locationIds, $request->input('category_id')),
            'laporan-tools-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportToolsPdf(Request $request)
    {
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

        $tools = Tool::query()
            ->when($locationIds, fn($q) => $q->whereIn('location_id', $locationIds))
            ->when($request->input('category_id'), fn($q, $v) => $q->where('category_id', $v))
            ->with(['category', 'location.parent'])
            ->orderBy('name')
            ->get();

        $pdf = Pdf::loadView('reports.tools-pdf', ['tools' => $tools]);

        return $pdf->download('laporan-tools-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportStockOpnamesExcel(Request $request)
    {
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

        return Excel::download(
            new StockOpnameReportExport($locationIds, $request->input('date_from'), $request->input('date_to')),
            'laporan-stock-opname-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    public function exportStockOpnamesPdf(Request $request)
    {
        $locationIds = $this->resolveLocationIds($request->input('location_id'));

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
    private function resolveLocationIds($locationId): ?array
    {
        if (!$locationId) {
            return null;
        }

        $location = Location::find($locationId);

        if (!$location) {
            return null;
        }

        return collect([$location->id])
            ->merge($location->children()->pluck('id'))
            ->all();
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

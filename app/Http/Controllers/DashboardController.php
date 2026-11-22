<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = auth()->user();

        $canViewOpname = $user->can('stock-opnames.index');

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $totalTools = DB::table('tools')->count();

        $totalStock = (int) DB::table('tools')->sum('stock');

        $problemQuery = DB::table('tools')
            ->whereIn('status', [
                'Rusak',
                'Hilang',
                'Tidak Tersedia',
            ]);

        $problemTools = (clone $problemQuery)->count();
        $problemStock = (int) (clone $problemQuery)->sum('stock');

        /*
        |--------------------------------------------------------------------------
        | Tools bermasalah terbaru
        |--------------------------------------------------------------------------
        */

        $latestProblemTools = DB::table('tools')
            ->leftJoin('categories', 'tools.category_id', '=', 'categories.id')
            ->leftJoin('locations', 'tools.location_id', '=', 'locations.id')
            ->select(
                'tools.id',
                'tools.tool_code',
                'tools.name',
                'tools.stock',
                'tools.status',
                'categories.name as category_name',
                'locations.name as location_name',
                'tools.updated_at'
            )
            ->whereIn('tools.status', [
                'Rusak',
                'Hilang',
                'Tidak Tersedia',
            ])
            ->orderByDesc('tools.updated_at')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Chart status
        |--------------------------------------------------------------------------
        */

        $toolsByStatus = DB::table('tools')
            ->select('status')
            ->selectRaw('COUNT(*) as total_tools')
            ->selectRaw('COALESCE(SUM(stock), 0) as total_stock')
            ->groupBy('status')
            ->orderByDesc('total_stock')
            ->get()
            ->map(fn($item) => [
                'name' => $item->status,
                'total' => (int) $item->total_stock,
                'tools' => (int) $item->total_tools,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Chart kategori
        |--------------------------------------------------------------------------
        */

        $toolsByCategory = DB::table('categories')
            ->leftJoin('tools', 'categories.id', '=', 'tools.category_id')
            ->select('categories.id', 'categories.name')
            ->selectRaw('COUNT(tools.id) as total_tools')
            ->selectRaw('COALESCE(SUM(tools.stock), 0) as total_stock')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_stock')
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'total' => (int) $item->total_stock,
                'tools' => (int) $item->total_tools,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Chart lokasi
        |--------------------------------------------------------------------------
        */

        $toolsByLocation = DB::table('locations')
            ->leftJoin('tools', 'locations.id', '=', 'tools.location_id')
            ->leftJoin(
                'locations as parents',
                'locations.parent_id',
                '=',
                'parents.id'
            )
            ->select(
                'locations.id',
                'locations.name',
                'parents.name as parent_name'
            )
            ->selectRaw('COUNT(tools.id) as total_tools')
            ->selectRaw('COALESCE(SUM(tools.stock), 0) as total_stock')
            ->groupBy(
                'locations.id',
                'locations.name',
                'parents.name'
            )
            ->orderByDesc('total_stock')
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'parent_name' => $item->parent_name,
                'label' => $item->parent_name
                    ? $item->name . ' - ' . $item->parent_name
                    : $item->name,
                'total' => (int) $item->total_stock,
                'tools' => (int) $item->total_tools,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Internal vs eksternal
        |--------------------------------------------------------------------------
        */

        $inventoryTypes = DB::table('tools')
            ->select('inventory_type')
            ->selectRaw('COUNT(*) as total_tools')
            ->selectRaw('COALESCE(SUM(stock), 0) as total_stock')
            ->groupBy('inventory_type')
            ->get()
            ->map(fn($item) => [
                'name' => $item->inventory_type,
                'total' => (int) $item->total_stock,
                'tools' => (int) $item->total_tools,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Tools terbaru
        |--------------------------------------------------------------------------
        */

        $latestTools = DB::table('tools')
            ->leftJoin('categories', 'tools.category_id', '=', 'categories.id')
            ->leftJoin('locations', 'tools.location_id', '=', 'locations.id')
            ->select(
                'tools.id',
                'tools.tool_code',
                'tools.name',
                'tools.stock',
                'tools.status',
                'categories.name as category_name',
                'locations.name as location_name',
                'tools.created_at'
            )
            ->orderByDesc('tools.created_at')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Top pemegang tools
        |--------------------------------------------------------------------------
        */

        $topHolders = DB::table('users')
            ->join('tools', 'users.id', '=', 'tools.used_by')
            ->select('users.id', 'users.name')
            ->selectRaw('COUNT(tools.id) as total_tools')
            ->selectRaw('COALESCE(SUM(tools.stock), 0) as total_stock')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_tools')
            ->limit(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Stock opname
        |--------------------------------------------------------------------------
        */

        $opname = [
            'lastOpname' => null,
            'discrepancyTotal' => 0,
            'discrepancyUnits' => 0,
            'discrepancyReasons' => [],
            'recentSessions' => [],
            'locationsNeedingOpname' => [],
        ];

        if ($canViewOpname) {
            // Pastikan status final di database memang "Selesai".
            $completedStatus = 'Selesai';

            /*
             * Opname terakhir
             */

            $lastOpname = DB::table('stock_opnames')
                ->join(
                    'locations',
                    'stock_opnames.location_id',
                    '=',
                    'locations.id'
                )
                ->leftJoin(
                    'users',
                    'stock_opnames.created_by',
                    '=',
                    'users.id'
                )
                ->where('stock_opnames.status', $completedStatus)
                ->select(
                    'stock_opnames.id',
                    'stock_opnames.status',
                    'stock_opnames.created_at',
                    'locations.name as location_name',
                    'users.name as created_by_name'
                )
                ->orderByDesc('stock_opnames.created_at')
                ->first();

            if ($lastOpname) {
                $detailsQuery = DB::table('stock_opname_details')
                    ->where('stock_opname_id', $lastOpname->id);

                $opname['discrepancyTotal'] = (clone $detailsQuery)
                    ->whereColumn('system_stock', '!=', 'physical_stock')
                    ->count();

                $opname['discrepancyUnits'] = (clone $detailsQuery)
                    ->selectRaw(
                        'COALESCE(SUM(ABS(system_stock - physical_stock)), 0) as total'
                    )
                    ->value('total');

                $opname['discrepancyReasons'] = (clone $detailsQuery)
                    ->whereColumn('system_stock', '!=', 'physical_stock')
                    ->select('discrepancy_reason')
                    ->selectRaw('COUNT(*) as total')
                    ->groupBy('discrepancy_reason')
                    ->orderByDesc('total')
                    ->get()
                    ->map(fn($item) => [
                        'name' => $item->discrepancy_reason ?: 'Tidak diketahui',
                        'total' => (int) $item->total,
                    ]);
            }

            $opname['lastOpname'] = $lastOpname;

            /*
             * Aktivitas opname terbaru
             */

            $opname['recentSessions'] = DB::table('stock_opnames')
                ->join(
                    'locations',
                    'stock_opnames.location_id',
                    '=',
                    'locations.id'
                )
                ->leftJoin(
                    'users',
                    'stock_opnames.created_by',
                    '=',
                    'users.id'
                )
                ->leftJoin(
                    'stock_opname_details',
                    'stock_opnames.id',
                    '=',
                    'stock_opname_details.stock_opname_id'
                )
                ->where('stock_opnames.status', $completedStatus)
                ->select(
                    'stock_opnames.id',
                    'stock_opnames.status',
                    'stock_opnames.created_at',
                    'locations.name as location_name',
                    'users.name as created_by_name'
                )
                ->selectRaw(
                    'COUNT(DISTINCT stock_opname_details.id) as total_items'
                )
                ->selectRaw(
                    'COUNT(DISTINCT CASE
                        WHEN stock_opname_details.system_stock
                            != stock_opname_details.physical_stock
                        THEN stock_opname_details.id
                    END) as total_discrepancies'
                )
                ->groupBy(
                    'stock_opnames.id',
                    'stock_opnames.status',
                    'stock_opnames.created_at',
                    'locations.name',
                    'users.name'
                )
                ->orderByDesc('stock_opnames.created_at')
                ->limit(5)
                ->get();

            /*
             * Lokasi yang perlu opname
             */

            $locations = DB::table('locations')
                ->leftJoin('stock_opnames', function ($join) use ($completedStatus) {
                    $join->on(
                        'locations.id',
                        '=',
                        'stock_opnames.location_id'
                    )->where(
                        'stock_opnames.status',
                        '=',
                        $completedStatus
                    );
                })
                ->leftJoin(
                    'locations as parents',
                    'locations.parent_id',
                    '=',
                    'parents.id'
                )
                ->select(
                    'locations.id',
                    'locations.name',
                    'parents.name as parent_name'
                )
                ->selectRaw('MAX(stock_opnames.created_at) as last_opname')
                ->groupBy(
                    'locations.id',
                    'locations.name',
                    'parents.name'
                )
                ->get();

            $opname['locationsNeedingOpname'] = $locations
                ->map(function ($location) {
                    $lastDate = $location->last_opname
                        ? Carbon::parse($location->last_opname)
                        : null;

                    $days = $lastDate
                        ? (int) $lastDate->startOfDay()
                            ->diffInDays(now()->startOfDay())
                        : null;

                    return [
                        'id' => $location->id,
                        'name' => $location->name,
                        'parent_name' => $location->parent_name,
                        'last_opname' => $location->last_opname,
                        'days_ago' => $days,
                        'needs_opname' => $days === null || $days > 30,
                    ];
                })
                ->filter(fn($item) => $item['needs_opname'])
                ->sortByDesc(fn($item) => $item['days_ago'] ?? PHP_INT_MAX)
                ->values();
        }

        /*
        |--------------------------------------------------------------------------
        | Inertia response
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Dashboard/Index', [
            'summary' => [
                'totalTools' => (int) $totalTools,
                'totalStock' => $totalStock,
                'problemTools' => (int) $problemTools,
                'problemStock' => (int) $problemStock,
                'lastDiscrepancy' => (int) $opname['discrepancyTotal'],
                'lastDiscrepancyUnits' => (int) $opname['discrepancyUnits'],
            ],

            'charts' => [
                'status' => $toolsByStatus,
                'category' => $toolsByCategory,
                'location' => $toolsByLocation,
                'inventoryType' => $inventoryTypes,
            ],

            'latestProblemTools' => $latestProblemTools,
            'latestTools' => $latestTools,
            'topHolders' => $topHolders,

            'canViewOpname' => $canViewOpname,
            'opname' => $opname,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockOpnameResource;
use App\Models\Location;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Http\Request;

class StockOpnameController extends Controller
{
    public function index()
    {

        $stockOpnames = StockOpname::withCount(['details as difference_count' => function ($query) {
            $query->whereColumn('system_stock', '!=', 'physical_stock');
        }])
            ->filters(request()->only([
                'location',
                'created_by',
                'date_from',
                'date_to',
            ]))
            ->sorting(request()->only(['field', 'direction']))
            ->with(['createdBy', 'location'])
            ->latest('opname_date')
            ->paginate(request()->input('load', 10));

        return inertia('StockOpnames/Index', [
            'page_setting' => [
                'title' => 'Stock Opname',
                'subtitle' => 'Menampilkan semua data stock opname yang tersedia di sistem ini',
                'method' => 'POST',
                'action' => route('location.store')
            ],
            'stockOpnames' => StockOpnameResource::collection($stockOpnames)->additional([
                'meta' => [
                    'has_pages' => $stockOpnames->hasPages(),
                ],
            ]),
            'locations' => Location::query()
                ->select(['id', 'name', 'slug', 'parent_id'])
                ->with([
                    'parent:id,name,slug',
                ])
                ->orderBy('name')
                ->get(),
            'users' => User::query()
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
            'state' => [
                'page' => request()->page ?? 1,
                'load' => 10,
                'location' => request()->input('location', ''),
                'created_by' => request()->input('created_by', ''),
                'date_from' => request()->input('date_from', ''),
                'date_to' => request()->input('date_to', ''),
            ]
        ]);
    }
}

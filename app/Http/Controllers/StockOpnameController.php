<?php

namespace App\Http\Controllers;

use App\Enums\StockOpnameEnum;
use App\Enums\DiscrepancyReasonEnum;
use App\Enums\MessageType;
use App\Http\Requests\StockOpnameRequest;
use App\Http\Resources\StockOpnameDetailIndexResource;
use App\Http\Resources\StockOpnameResource;
use App\Models\Location;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

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
            ->with(['createdBy', 'location', 'details.tool'])
            ->latest('created_at')
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
                ->withCount(['tools'])
                ->with([
                    'parent:id,name,slug',
                ])
                ->orderBy('name')
                ->get(),
            'users' => User::query()
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
            'discrepancy_reasons' => DiscrepancyReasonEnum::options(),
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

    public function store(StockOpnameRequest $request)
    {
        $location = Location::findOrFail($request->location_id);

        $locationIds = collect([$location->id]);

        if ($request->boolean('include_children')) {
            $locationIds = $locationIds->merge(
                $location->children()->pluck('id')
            );
        }

        $tools = Tool::whereIn('location_id', $locationIds)->get();

        $existDraftStatus = StockOpname::where('location_id', $request->location_id)->where('status', StockOpnameEnum::DRAFT->value)->exists();

        if ($tools->isEmpty()) {
            return response()->json([
                'message' => 'Lokasi ini belum punya tools sama sekali, gak ada yang bisa di-opname.',
            ], 422);
        }


        if ($existDraftStatus) {
            return response()->json([
                'message' => 'Ada stok opname di lokasi ini yang masih berstatus "Draft", selesaikan terlebih dahulu sebelum membuat stok opname di lokasi yg sama',
            ], 422);
        }

        $stockOpname = DB::transaction(function () use ($request, $tools) {
            $stockOpname = StockOpname::create([
                'note' => $request->note,
                'created_by' => Auth::id(),
                'location_id' => $request->location_id,
            ]);

            foreach ($tools as $tool) {
                StockOpnameDetail::create([
                    'stock_opname_id' => $stockOpname->id,
                    'tool_id' => $tool->id,
                    'system_stock' => $tool->stock,
                    'physical_stock' => $tool->stock, // default disamain, user yang koreksi kalau beda
                    'status' => 'Sesuai', // default, ke-update pas physical_stock diubah di step 2
                    'note' => null,
                ]);
            }

            return $stockOpname;
        });

        $stockOpname->load(['details.tool', 'location', 'createdBy']);

        return response()->json([
            'stock_opname' => new StockOpnameDetailIndexResource($stockOpname),
        ], 201);
    }


    public function destroy(StockOpname $stockOpname)
    {
        try {


            $stockOpname->delete();
            flashMessage(MessageType::DELETED->message('Stock Opname'));
            return back();
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }
}

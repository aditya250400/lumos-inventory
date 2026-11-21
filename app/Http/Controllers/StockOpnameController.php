<?php

namespace App\Http\Controllers;

use App\Enums\StockOpnameEnum;
use App\Enums\DiscrepancyReasonEnum;
use App\Enums\MessageType;
use App\Http\Requests\StockOpnameRequest;
use App\Http\Resources\StockOpnameDetailIndexResource;
use App\Http\Resources\StockOpnameResource;
use App\Models\Category;
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
                'category',
            ]))
            ->sorting(request()->only(['field', 'direction']))
            ->with(['createdBy', 'location', 'details.tool', 'category'])
            ->latest('created_at')
            ->paginate(request()->input('load', 50));

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
                ->has('tools')
                ->with([
                    'parent:id,name,slug',
                ])
                ->withCount('tools')
                ->orderBy('name')
                ->get(),
            'categories' => Category::query()
                ->select(['id', 'name', 'slug'])
                ->orderBy('name')
                ->get(),
            'users' => User::query()
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
            'discrepancy_reasons' => DiscrepancyReasonEnum::options(),
            'state' => [
                'page' => request()->page ?? 1,
                'load' => 50,
                'location' => request()->input('location', ''),
                'category' => request()->input('category', ''),
                'created_by' => request()->input('created_by', ''),
                'date_from' => request()->input('date_from', ''),
                'date_to' => request()->input('date_to', ''),
            ]
        ]);
    }

    public function store(StockOpnameRequest $request)
    {
        $location = Location::findOrFail($request->location_id);

        // Jika categoryId kosong (""), berarti semua kategori
        $category = null;

        if ($request->filled('categoryId')) {
            $category = Category::find($request->categoryId);

            if (!$category) {
                return response()->json([
                    'message' => 'Kategori tidak ditemukan.',
                ], 422);
            }
        }

        $locationIds = collect([$location->id]);

        if ($request->boolean('include_children')) {
            $locationIds = $locationIds->merge(
                $location->children()->pluck('id')
            );
        }

        // Ambil tools berdasarkan lokasi
        $toolsQuery = Tool::whereIn('location_id', $locationIds);

        // Filter kategori hanya jika categoryId tidak kosong
        if ($category) {
            $toolsQuery->where('category_id', $category->id);
        }

        $tools = $toolsQuery->get();

        // Validasi jika tidak ada tools
        if ($tools->isEmpty()) {
            return response()->json([
                'message' => $category
                    ? "Lokasi ini belum punya tools dengan kategori {$category->name}"
                    : 'Lokasi ini belum punya tools sama sekali, gak ada yang bisa di-opname.',
            ], 422);
        }

        // Cek draft stok opname
        $existDraftStatus = StockOpname::where('location_id', $request->location_id)
            ->where('status', StockOpnameEnum::DRAFT->value)
            ->exists();

        if ($existDraftStatus) {
            return response()->json([
                'message' => 'Ada stok opname di lokasi ini yang masih berstatus "Draft", selesaikan terlebih dahulu sebelum membuat stok opname di lokasi yg sama',
            ], 422);
        }

        // Buat stok opname
        $stockOpname = DB::transaction(function () use ($request, $tools) {
            $stockOpname = StockOpname::create([
                'note' => $request->note,
                'created_by' => Auth::id(),
                'location_id' => $request->location_id,
                'category_id' => $request->filled('categoryId')
                    ? $request->categoryId
                    : null,
            ]);

            foreach ($tools as $tool) {
                StockOpnameDetail::create([
                    'stock_opname_id' => $stockOpname->id,
                    'tool_id' => $tool->id,
                    'system_stock' => $tool->stock,
                    'physical_stock' => $tool->stock,
                    'status' => 'Sesuai',
                    'note' => null,
                ]);
            }

            return $stockOpname;
        });

        $stockOpname->load(['details.tool', 'location', 'createdBy', 'category']);

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

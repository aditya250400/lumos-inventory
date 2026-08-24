<?php

namespace App\Http\Controllers;

use App\Enums\InventoryTypeEnum;
use App\Enums\MessageType;
use App\Enums\ToolEnum;
use App\Http\Requests\LocationRequest;
use App\Http\Requests\SubLocationRequest;
use App\Http\Resources\LocationResource;
use App\Http\Resources\ToolsResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::query()
            ->filter(request()->only(['search']))
            ->whereNull('parent_id')
            ->withCount(['tools', 'children'])
            ->withSum('tools', 'stock')
            ->with([
                'user',
                'children' => function ($query) {
                    $query
                        ->withCount('tools')
                        ->withSum('tools', 'stock');
                },
            ])
            ->selectSub(function ($query) {
                $query->from('tools')
                    ->selectRaw('COUNT(*)')
                    ->whereIn('location_id', function ($query) {
                        $query->select('id')
                            ->from('locations')
                            ->whereColumn('parent_id', 'locations.id');
                    });
            }, 'children_tools_count')
            ->selectRaw('
        (
            SELECT COUNT(*)
            FROM tools
            WHERE tools.location_id = locations.id
        ) + (
            SELECT COUNT(*)
            FROM tools
            WHERE tools.location_id IN (
                SELECT id
                FROM locations AS children
                WHERE children.parent_id = locations.id
            )
        ) AS total_tools
    ')
            ->when(
                request('field') === 'total_tools',
                fn($query) => $query->orderBy(
                    'total_tools',
                    request('direction', 'asc')
                )
            )
            ->when(
                request('field') !== 'total_tools',
                fn($query) => $query->sorting(
                    request()->only(['field', 'direction'])
                )
            )
            ->orderBy('name')
            ->paginate(request()->load ?? 10);


        return inertia('Location/Index', [
            'page_settings' => [
                'title' => 'Lokasi',
                'subtitle' => 'Menampilkan semua data lokasi yang tersedia di sistem ini',
                'method' => 'POST',
                'action' => route('location.store')
            ],
            'locations' => LocationResource::collection($locations)->additional([
                'meta' => [
                    'has_pages' => $locations->hasPages(),
                ],

            ]),
            'users' => User::orderBy('name')->get()->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
            ]),
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10
            ]
        ]);
    }

    public function show(Location $location)
    {
        $location->loadCount(['tools', 'children'])
            ->loadSum('tools', 'stock');

        $location->load(['children' => function ($query) {
            $query
                ->with(['user'])
                ->withCount('tools')
                ->withSum('tools', 'stock')
                ->orderBy('tools_count', 'desc');
        }]);

        // "Semua sub lokasi" di UI itu agregat: tools milik lokasi ini sendiri + semua sub lokasinya
        $totalToolsAll = $location->tools_count + $location->children->sum('tools_count');
        $totalStockAll = ($location->tools_sum_stock ?? 0) + $location->children->sum('tools_sum_stock');

        return inertia('Location/Show', [
            'page_settings' => [
                'title' => $location->name,
                'subtitle' => "Detail lokasi {$location->name}",
            ],
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'slug' => $location->slug,
                'children_count' => $location->children_count,
                'total_tools' => $totalToolsAll,
                'total_stock' => $totalStockAll,
                'tools_parent_count' => $location->tools_count,
                'tools_parent_stock' => $location->tools_sum_stock ?? 0,
                'children' => $location->children->map(fn($child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'slug' => $child->slug,
                    'user_id' => $child->user_id,
                    'user' => $child->user,
                    'tools_count' => $child->tools_count,
                    'total_stock' => $child->tools_sum_stock ?? 0,
                ]),
            ],
            'users' => User::orderBy('name')->get()->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
            ]),
        ]);
    }


    public function store(LocationRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // 1. Buat lokasi induk dulu
                $location = Location::create([
                    'name' => $request['name'],
                    'parent_id' => null,
                    'user_id' => null,
                ]);

                // 2. Loop sub_locations, tiap item jadi lokasi baru dengan parent_id ke lokasi di atas
                foreach ($request['sub_locations'] ?? [] as $sub) {
                    Location::create([
                        'name' => $sub['name'],
                        'parent_id' => $location->id,
                        'user_id' => ($sub['has_owner'] ?? false) ? $sub['user_id'] : null,
                    ]);
                }
            });


            flashMessage(MessageType::CREATED->message('Lokasi'));
            return to_route('location.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function update(LocationRequest $request, Location $location)
    {
        try {
            DB::transaction(function () use ($request, $location) {
                // 1. Update lokasi induknya sendiri
                $location->update([
                    'name' => $request['name'],
                ]);

                $incomingSubs = collect($request['sub_locations'] ?? []);
                $incomingIds = $incomingSubs->pluck('id')->filter()->all();

                // 2. Cari sub lokasi yang mau dihapus (ada di database, tapi sudah gak ada di payload)
                $toDelete = $location->children()
                    ->whereNotIn('id', $incomingIds)
                    ->withCount('tools')
                    ->get();

                // 2a. Kalau ada salah satu yang masih punya tools, batalkan seluruh proses
                //     (dilempar sebagai exception, jadi DB::transaction otomatis rollback semuanya,
                //     termasuk perubahan nama lokasi & sub lokasi lain yang mungkin sudah sempat diproses).
                $blocked = $toDelete->firstWhere(fn($child) => $child->tools_count > 0);

                if ($blocked) {
                    throw new \RuntimeException(
                        "Sub lokasi \"{$blocked->name}\" tidak bisa dihapus karena masih memiliki {$blocked->tools_count} tools. Pindahkan atau hapus tools tersebut terlebih dahulu."
                    );
                }

                // 2b. Aman dihapus (gak ada yang punya tools)
                $location->children()
                    ->whereNotIn('id', $incomingIds)
                    ->delete();

                // 3. Loop payload: yang punya id -> update, yang tidak -> buat baru
                foreach ($incomingSubs as $sub) {
                    $payload = [
                        'name' => $sub['name'],
                        'parent_id' => $location->id,
                        'user_id' => ($sub['has_owner'] ?? false) ? $sub['user_id'] : null,
                    ];

                    if (!empty($sub['id'])) {
                        Location::whereKey($sub['id'])->update($payload);
                    } else {
                        Location::create($payload);
                    }
                }
            });

            flashMessage(MessageType::UPDATED->message('Lokasi'));
            return to_route('location.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function destroy(Location $location)
    {
        try {
            // Kumpulkan id lokasi ini + semua sub lokasinya, baru hitung total tools
            // yang nempel ke salah satu dari id-id itu (gak peduli langsung ke induk
            // atau ke salah satu sub lokasinya).
            $locationIds = $location->children()->pluck('id')->push($location->id);
            $totalTools = Tool::whereIn('location_id', $locationIds)->count();

            if ($totalTools > 0) {
                flashMessage(
                    "Lokasi \"{$location->name}\" tidak bisa dihapus karena masih ada {$totalTools} tools (termasuk yang ada di sub lokasinya). Pindahkan atau hapus tools tersebut terlebih dahulu.",
                    'error'
                );
                return to_route('location.index');
            }

            DB::transaction(function () use ($location) {
                // Aman, gak ada tools sama sekali -> sub lokasinya ikut dihapus juga
                $location->children()->delete();
                $location->delete();
            });

            flashMessage(MessageType::DELETED->message('Lokasi'));
            return to_route('location.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('location.index');
        }
    }



    // subs location
    // ================= Sub-lokasi (nested resource di bawah location) =================

    public function storeSubLocation(SubLocationRequest $request, Location $location)
    {
        try {
            Location::create([
                'name' => $request['name'],
                'parent_id' => $location->id,
                'user_id' => ($request['has_owner'] ?? false) ? $request['user_id'] : null,
            ]);

            flashMessage(MessageType::CREATED->message('Sub Lokasi'));
            return to_route('location.show', $location->slug);
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function updateSubLocation(SubLocationRequest $request, Location $location, Location $subLocation)
    {
        try {
            $subLocation->update([
                'name' => $request['name'],
                'user_id' => ($request['has_owner'] ?? false) ? $request['user_id'] : null,
            ]);

            flashMessage(MessageType::UPDATED->message('Sub Lokasi'));
            return to_route('location.show', $location->slug);
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function destroySubLocation(Location $location, Location $subLocation)
    {
        try {
            $toolsCount = $subLocation->tools()->count();

            if ($toolsCount > 0) {
                flashMessage(
                    "Sub lokasi \"{$subLocation->name}\" tidak bisa dihapus karena masih memiliki {$toolsCount} tools.",
                    'error'
                );
                return to_route('location.show', $location->slug);
            }

            $subLocation->delete();
            flashMessage(MessageType::DELETED->message('Sub Lokasi'));
            return to_route('location.show', $location->slug);
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('location.show', $location->slug);
        }
    }



    // tools subs locations

    public function toolsSubLocation(Location $location, Location $subLocation)
    {

        $subLocation->loadCount(['tools', 'children'])
            ->loadSum('tools', 'stock');

        $subLocation->load(['parent', 'user']);

        $tools = Tool::filter(request()->only(['search']))
            ->sorting(request()->only(['field', 'direction']))
            ->where('location_id', $subLocation->id)
            ->with(['category', 'location' => fn($query) => $query->with('parent'), 'images', 'attributeValues.attribute', 'usedBy'])
            ->paginate(request()->load ?? 10);

        return inertia('Location/SubLocationTool', [
            'page_settings' => [
                'title' => $subLocation->name,
                'subtitle' => "Detail subs lokasi dari {$subLocation->name}",
            ],
            'categories' => Category::query()
                ->select(['id', 'name', 'slug'])
                ->with([
                    'attributes' => fn($query) => $query
                        ->select(['id', 'category_id', 'field_name'])
                        ->orderBy('field_name'),
                ])
                ->orderBy('name')
                ->get(),


            'locations' => Location::query()
                ->select(['id', 'name', 'slug', 'parent_id'])
                ->with([
                    'parent:id,name,slug',
                ])
                ->orderBy('name')
                ->get(),


            'users' => User::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'statuses' => ToolEnum::options(),
            'inventory_types' => InventoryTypeEnum::options(),
            'location' => $location,
            'tools' => ToolsResource::collection($tools)->additional([
                'meta' => [
                    'has_pages' => $tools->hasPages(),
                ],
            ]),
            'subLocation' => [
                'id' => $subLocation->id,
                'name' => $subLocation->name,
                'slug' => $subLocation->slug,
                'user' => $subLocation->user,
                'tools_count' => $subLocation->tools_count,
                'total_stock' => $subLocation->tools_sum_stock ?? 0,
                'parent' => $subLocation->parent ? [
                    'id' => $subLocation->parent->id,
                    'name' => $subLocation->parent->name,
                    'slug' => $subLocation->parent->slug,
                    'tools_count' => $subLocation->parent->tools_count,
                    'total_stock' => $subLocation->parent->tools_sum_stock ?? 0,
                ] : null,
            ],
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10
            ],
        ]);
    }

    public function locationToolsIndex(Request $request, Location $location)
    {
        $scope = $request->input('scope', 'all');

        /*
     * ============================================================
     * LOCATION IDS
     * ============================================================
     *
     * direct = hanya location ini
     * all    = location ini + seluruh child
     */
        $locationIds = collect([$location->id]);

        if ($scope !== 'direct') {
            $children = $location->children()
                ->with('children')
                ->get();

            $collectChildren = function ($locations) use (&$collectChildren, &$locationIds) {
                foreach ($locations as $child) {
                    $locationIds->push($child->id);

                    if ($child->children->isNotEmpty()) {
                        $collectChildren($child->children);
                    }
                }
            };

            $collectChildren($children);
        }

        $locationIds = $locationIds->unique()->values();

        /*
     * ============================================================
     * TOOLS QUERY
     * ============================================================
     */
        $query = Tool::query()
            ->whereIn('location_id', $locationIds);

        $tools = $query
            ->filter($request->only(['search']))
            ->sorting($request->only(['field', 'direction']))
            ->with([
                'category',
                'location' => fn($locationQuery) => $locationQuery->with('parent'),
                'images',
                'attributeValues.attribute',
                'usedBy',
            ])
            ->paginate($request->input('load', 10))
            ->withQueryString();

        /*
     * ============================================================
     * STATISTICS
     * ============================================================
     *
     * Menggunakan locationIds yang sama dengan tools.
     *
     * direct:
     *   hanya tools location ini
     *
     * all:
     *   tools location ini + seluruh child
     */
        $totalTools = Tool::query()
            ->whereIn('location_id', $locationIds)
            ->count();

        $totalStock = Tool::query()
            ->whereIn('location_id', $locationIds)
            ->sum('stock');

        return inertia('Location/LocationTool', [
            'page_settings' => [
                'title' => $location->name,
                'subtitle' => $scope === 'direct'
                    ? "Tools langsung di {$location->name}"
                    : "Semua tools di {$location->name} dan seluruh sub lokasinya",
            ],
            'categories' => Category::query()
                ->select(['id', 'name', 'slug'])
                ->with([
                    'attributes' => fn($query) => $query
                        ->select(['id', 'category_id', 'field_name'])
                        ->orderBy('field_name'),
                ])
                ->orderBy('name')
                ->get(),


            'locations' => Location::query()
                ->select(['id', 'name', 'slug', 'parent_id'])
                ->with([
                    'parent:id,name,slug',
                ])
                ->orderBy('name')
                ->get(),


            'users' => User::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'statuses' => ToolEnum::options(),
            'inventory_types' => InventoryTypeEnum::options(),
            'location' => [
                'id' => $location->id,
                'name' => $location->name,
                'slug' => $location->slug,
                'user' => $location->user,
                'tools_count' => $totalTools,
                'total_stock' => $totalStock,
            ],

            'tools' => ToolsResource::collection($tools)->additional([
                'meta' => [
                    'has_pages' => $tools->hasPages(),
                ],
            ]),

            'state' => [
                'page' => $request->input('page', 1),
                'search' => $request->input('search', ''),
                'load' => $request->input('load', 10),
                'scope' => $scope,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Enums\InventoryTypeEnum;
use App\Enums\MessageType;
use App\Enums\ToolEnum;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\ToolAttributeRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ToolAttributeResource;
use App\Http\Resources\ToolsResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\ToolAttribute;
use App\Models\ToolAttributeValue;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()
            ->filter(request()->only(['search']))
            ->sorting(
                request()->only(['field', 'direction'])
            )
            ->withCount(['tools', 'attributes'])
            ->with(['attributes' => fn($query) => $query->withCount('values')->with('category')->orderBy('field_name')])
            ->orderBy('name')
            ->paginate(request()->load ?? 10);


        return inertia('Category/Index', [
            'page_settings' => [
                'title' => 'Kategori Tools',
                'subtitle' => 'Menampilkan semua data Kategori tools yang tersedia di sistem ini',
                'method' => 'POST',
                'action' => route('category.store')
            ],
            'categories' => CategoryResource::collection($categories)->additional([
                'meta' => [
                    'has_pages' => $categories->hasPages(),
                ],

            ]),
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10
            ]
        ]);
    }


    public function show(Category $category)
    {
        $category->loadCount(['tools', 'attributes as attributes_count'])
            ->loadSum('tools', 'stock');


        // Total value dihitung lintas semua attribute milik kategori ini
        $category->attribute_values_count = ToolAttributeValue::whereHas('attribute', function ($query) use ($category) {
            $query->where('category_id', $category->id);
        })->count();

        $tools = Tool::filter(request()->only(['search']))
            ->sorting(request()->only(['field', 'direction']))
            ->where('category_id', $category->id)
            ->with(['location' => fn($query) => $query->with('parent'), 'images', 'attributeValues.attribute', 'usedBy', 'category'])
            ->paginate(request()->load ?? 10);

        // Definisi attribute per kategori biasanya sedikit -> ambil semua (gak usah dipaginasi),
        // sekalian dipakai buat nentuin kolom dinamis di tabel Tools (aman karena semua row di
        // halaman ini sudah pasti 1 kategori yang sama).
        $attributes = $category->attributes()
            ->withCount('values')
            ->orderBy('field_name')
            ->get();

        return inertia('Category/Show', [
            'page_settings' => [
                'title' => $category->name,
                'subtitle' => "Detail kategori {$category->name}",
            ],
            'action' => route('tools.store'),
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
            'category' => new CategoryResource($category),
            'tools' => ToolsResource::collection($tools)->additional([
                'meta' => [
                    'has_pages' => $tools->hasPages(),
                ],
            ]),
            'attributes' => ToolAttributeResource::collection($attributes),
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10
            ],
        ]);
    }

    public function store(CategoryRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // 1. Buat kategori dulu
                $category = Category::create([
                    'name' => $request['name'],
                ]);

                // 2. Loop attributes
                foreach ($request['attributes'] ?? [] as $att) {
                    ToolAttribute::create([
                        'field_name' => $att['field_name'],
                        'category_id' => $category->id,
                    ]);
                }
            });


            flashMessage(MessageType::CREATED->message('Kategori Tool'));
            return to_route('category.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function update(CategoryRequest $request, Category $category)
    {
        try {
            DB::transaction(function () use ($request, $category) {
                $data = $request->validated();

                // 1. Update category
                $category->update([
                    'name' => $data['name'],
                ]);

                $incomingAttributes = collect($data['attributes'] ?? []);

                // ID attribute yang masih dikirim dari frontend
                $incomingIds = $incomingAttributes
                    ->pluck('id')
                    ->filter()
                    ->values();

                // 2. Cari attribute lama yang sudah tidak ada di payload
                $toDelete = $category->attributes()
                    ->whereNotIn('id', $incomingIds)
                    ->withCount('values')
                    ->get();

                // 3. Pastikan attribute yang mau dihapus belum digunakan
                $blocked = $toDelete->firstWhere(
                    fn($attribute) => $attribute->values_count > 0
                );

                if ($blocked) {
                    throw new \RuntimeException(
                        "Attribute \"{$blocked->field_name}\" tidak bisa dihapus karena masih digunakan oleh {$blocked->values_count} tools."
                    );
                }

                // 4. Hapus attribute yang sudah tidak ada di payload
                $category->attributes()
                    ->whereNotIn('id', $incomingIds)
                    ->delete();

                // 5. Update attribute lama / create attribute baru
                foreach ($incomingAttributes as $attribute) {
                    $payload = [
                        'field_name' => trim($attribute['field_name']),
                    ];

                    if (!empty($attribute['id'])) {
                        $category->attributes()
                            ->whereKey($attribute['id'])
                            ->update($payload);
                    } else {
                        $category->attributes()->create($payload);
                    }
                }
            });

            flashMessage(MessageType::UPDATED->message('Kategori Tool'));

            return to_route('category.index');
        } catch (Throwable $e) {
            report($e);

            flashMessage(
                MessageType::ERROR->message(error: $e->getMessage()),
                'error'
            );

            return back()->withInput();
        }
    }

    public function destroy(Category $category)
    {
        try {
            DB::transaction(function () use ($category) {
                $toolsCount = $category->tools()->count();

                if ($toolsCount > 0) {
                    throw new \RuntimeException(
                        "Kategori \"{$category->name}\" tidak bisa dihapus karena masih digunakan oleh {$toolsCount} tools. Pindahkan atau hapus tools tersebut terlebih dahulu."
                    );
                }

                $category->delete();
            });

            flashMessage(MessageType::DELETED->message('Kategori Tool'));

            return to_route('category.index');
        } catch (Throwable $e) {
            report($e);

            flashMessage(
                MessageType::ERROR->message(error: $e->getMessage()),
                'error'
            );

            return back();
        }
    }



    // tool attribute

    public function storeAttribute(ToolAttributeRequest $request, Category $category)
    {
        try {
            $category->attributes()->create([
                'field_name' => $request['field_name'],
            ]);

            flashMessage(MessageType::CREATED->message('Attribute'));
            return to_route('category.show', $category->slug);
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function updateAttribute(
        ToolAttributeRequest $request,
        Category $category,
        ToolAttribute $attribute
    ) {
        try {
            if ($attribute->category_id !== $category->id) {
                abort(404);
            }

            $attribute->update([
                'field_name' => $request->field_name,
            ]);

            flashMessage(MessageType::UPDATED->message('Attribute'));

            return to_route('category.show', $category);
        } catch (Throwable $e) {
            report($e);

            flashMessage(
                MessageType::ERROR->message(error: $e->getMessage()),
                'error'
            );

            return back();
        }
    }

    public function destroyAttribute(Category $category, ToolAttribute $attribute)
    {


        try {
            $valuesCount = $attribute->values()->count();

            if ($valuesCount > 0) {
                flashMessage(
                    "Attribute \"{$attribute->field_name}\" tidak bisa dihapus karena sudah dipakai oleh {$valuesCount} attribute value.",
                    'error'
                );
                return to_route('category.show', $category->slug);
            }

            $attribute->delete();
            flashMessage(MessageType::DELETED->message('Attribute'));
            return to_route('category.show', $category->slug);
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('category.show', $category->slug);
        }
    }
}

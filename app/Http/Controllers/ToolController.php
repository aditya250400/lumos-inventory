<?php

namespace App\Http\Controllers;

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Http\Resources\ToolsResource;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Http\Request;
use App\Enums\MessageType;
use App\Http\Requests\ToolRequest;
use App\Http\Resources\ToolDetailResource;
use App\Models\Image;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ToolController extends Controller
{
    public function index()
    {
        $query = Tool::query();

        $tools = $query
            ->filter(request()->only(['search']))
            ->filters(request()->only([
                'category',
                'location',
                'status',
                'inventory_type',
                'used_by',
            ]))
            ->sorting(request()->only(['field', 'direction']))
            ->with([
                'category',
                'location' => fn($locationQuery) => $locationQuery->with('parent'),
                'images',
                'attributeValues.attribute',
                'usedBy',
            ])
            ->paginate(request()->input('load', 15))
            ->withQueryString();

        return inertia('Tool/Index', [
            'page_settings' => [
                'title' => 'Tools',
                'subtitle' => "Semua daftar tools yang ada di sistem ini",
            ],
            'tools' => ToolsResource::collection($tools)->additional([
                'meta' => [
                    'has_pages' => $tools->hasPages(),
                ],
            ]),
            'method' => 'POST',
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
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 15,
                'category' => request()->input('category', ''),
                'location' => request()->input('location', ''),
                'status' => request()->input('status', ''),
                'inventory_type' => request()->input('inventory_type', ''),
                'used_by' => request()->input('used_by', ''),
            ],
        ]);
    }
    public function show(Tool $tool)
    {
        $tool->load([
            'category',
            'location.parent',
            'usedBy',
            'images',
            'attributeValues.attribute',
            'stockOpnameDetails' => fn($query) => $query->with('stockOpname')->latest(),
            'loans' => fn($query) => $query->with('loanBy')->latest(),
        ]);

        return inertia('Tool/Show', [
            'page_settings' => [
                'title' => $tool->name,
                'subtitle' => "Detail tool {$tool->tool_code}",
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
            'tool' => new ToolDetailResource($tool),
        ]);
    }

    public function store(ToolRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $category = Category::findOrFail($request->category_id);

                $tool = Tool::create([
                    'tool_code' => $this->generateToolCode($category),
                    'name' => $request->name,
                    'stock' => $request->stock,
                    'category_id' => $request->category_id,
                    'location_id' => $request->location_id,
                    'inventory_type' => $request->inventory_type,
                    'status' => $request->status,
                    'used_by' => $request->used_by,
                    'note' => $request->note,
                ]);

                $this->syncAttributes($tool, $request->input('attributes', []));
                $this->syncImages($tool, $request->input('images', []));
            });

            flashMessage(MessageType::CREATED->message('Tool'));
            return back();
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function update(ToolRequest $request, Tool $tool)
    {
        try {
            DB::transaction(function () use ($request, $tool) {
                $tool->update([
                    'name' => $request->name,
                    'stock' => $request->stock,
                    'category_id' => $request->category_id,
                    'location_id' => $request->location_id,
                    'inventory_type' => $request->inventory_type,
                    'status' => $request->status,
                    'used_by' => $request->used_by,
                    'note' => $request->note,
                ]);

                $this->syncAttributes($tool, $request->input('attributes', []));
                $this->syncImages($tool, $request->input('images', []));
            });

            flashMessage(MessageType::UPDATED->message('Tool'));
            return back();
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function destroy(Tool $tool)
    {
        try {
            DB::transaction(function () use ($tool) {
                // Tool yang sudah pernah masuk stock opname tidak boleh dihapus
                if ($tool->stockOpnameDetails()->exists()) {
                    throw new \RuntimeException(
                        "Tool \"{$tool->name}\" ({$tool->tool_code}) tidak bisa dihapus karena sudah memiliki riwayat stock opname."
                    );
                }

                // Tool yang sedang dipinjam harus dikembalikan terlebih dahulu
                if ($tool->status === ToolEnum::LOAN->value) {
                    throw new \RuntimeException(
                        "Tool \"{$tool->name}\" ({$tool->tool_code}) sedang dipinjam dan tidak bisa dihapus. Kembalikan tool terlebih dahulu."
                    );
                }

                // Hapus file gambar dari storage sebelum record image ikut terhapus
                $tool->images()->get()->each(function (Image $image) {
                    Storage::disk('public')->delete($image->name);
                });

                // Images dan attribute values akan ikut terhapus
                // berdasarkan foreign key ON DELETE CASCADE.
                $tool->delete();
            });

            flashMessage(MessageType::DELETED->message('Tool'));

            return back();
        } catch (Throwable $e) {
            report($e);

            flashMessage(
                MessageType::ERROR->message(error: $e->getMessage()),
                'error'
            );

            return back();
        }
    }


    /**
     * Generate tool_code otomatis dari slug kategori, misal "SSD-000012".
     * lockForUpdate() mencegah 2 request barengan dapat nomor urut yang sama.
     */
    private function generateToolCode(Category $category): string
    {
        $prefix = strtoupper($category->slug);

        $lastTool = Tool::where('tool_code', 'like', $prefix . '-%')
            ->orderByDesc('tool_code')
            ->lockForUpdate()
            ->first();

        $lastNumber = $lastTool
            ? (int) substr($lastTool->tool_code, strlen($prefix) + 1)
            : 0;

        return $prefix . '-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Full replace: hapus semua attribute value lama punya tool ini, insert ulang
     * dari payload. Value kosong/null gak usah disimpan (biar gak numpuk row percuma).
     */
    private function syncAttributes(Tool $tool, array $attributes): void
    {
        $tool->attributeValues()->delete();

        foreach ($attributes as $attribute) {
            if (blank($attribute['value'] ?? null)) {
                continue;
            }

            $tool->attributeValues()->create([
                'tool_attribute_id' => $attribute['tool_attribute_id'],
                'value' => $attribute['value'],
            ]);
        }
    }

    /**
     * Sinkronisasi foto: yang type=existing tapi id-nya udah gak ada di payload
     * (dihapus user di form) -> hapus row + file-nya. Yang type=new -> upload baru.
     * is_primary di-update sesuai payload buat semua foto yang dipertahankan.
     */
    private function syncImages(Tool $tool, array $imagesPayload): void
    {
        $keepIds = collect($imagesPayload)
            ->where('type', 'existing')
            ->pluck('id')
            ->filter()
            ->all();

        $tool->images()->whereNotIn('id', $keepIds)->get()->each(function (Image $image) {
            Storage::disk('public')->delete($image->name);
            $image->delete();
        });

        foreach ($imagesPayload as $index => $imageData) {
            $isPrimary = (bool) ($imageData['is_primary'] ?? false);

            if (($imageData['type'] ?? null) === 'existing' && !empty($imageData['id'])) {
                Image::whereKey($imageData['id'])->update(['is_primary' => $isPrimary]);
                continue;
            }

            // File diakses per-index, bukan lewat $request->input(), karena upload
            // file di Laravel disimpan terpisah dari input array biasa.
            $file = request()->file("images.{$index}.file");

            if ($file) {
                $path = $file->store('tools', 'public');

                $tool->images()->create([
                    'name' => $path,
                    'is_primary' => $isPrimary,
                ]);
            }
        }
    }
}

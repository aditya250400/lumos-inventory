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
            'categories' => Category::query()
                ->select(['id', 'name', 'slug'])
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
    public function show() {}
    public function stor() {}
    public function update() {}
    public function destroy() {}
}

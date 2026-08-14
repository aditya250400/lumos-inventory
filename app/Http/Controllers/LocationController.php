<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Http\Requests\LocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location
            ::filter(request()->only(['search']))
            ->sorting(request()->only(['field', 'direction']))
            ->whereNull('parent_id')
            ->withSum('tools', 'stock')
            ->withCount(['tools', 'children'])
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

    public function show() {}


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
}

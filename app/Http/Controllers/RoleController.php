<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Throwable;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::query()
            ->select(['id', 'name', 'guard_name', 'created_at'])
            ->with('permissions')
            ->when(request()->search ?? null, function ($query, $search) {
                $query->whereAny([
                    'name',
                    'guard_name',
                ], 'REGEXP', $search);
            })
            ->when(request()->field ?? null &&  request()->direction ?? null, fn($query) => $query->orderBy(request()->field, request()->direction))
            ->paginate(request()->load ?? 10);


        return inertia('Roles/Index', [
            'page_setting' => [
                'title' => 'Peran',
                'subtitle' => 'Menampilkan semua data Peran yang tersedia di Sekolah ini'
            ],
            'roles' => RoleResource::collection($roles)->additional([
                'meta' => [
                    'has_pages' => $roles->hasPages(),
                ],
            ]),
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10
            ]
        ]);
    }

    public function create()
    {
        $permissions = Permission::query()->select(['id', 'name'])->orderBy('name')->get()->map(fn($item) => [
            'value' => $item->id,
            'label' => $item->name,
        ]);


        return inertia('Roles/Create', [
            'page_setting' => [
                'title' => 'Tambah Peran',
                'subtitle' => 'Buat Peran baru disini. Klik simpan setelah selesai',
                'method' => 'POST',
                'action' => route('roles.store')
            ],
            'permissions' => $permissions,
        ]);
    }

    public function store(RoleRequest $request)
    {
        try {
            $role = Role::create([
                'name' =>  $request->name,
            ]);

            $role->syncPermissions($request->permissions);


            flashMessage(MessageType::CREATED->message('Role'));
            return to_route('roles.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('roles.index');
        }
    }

    public function edit(Role $role)
    {
        $permissions = Permission::query()->select(['id', 'name'])->orderBy('name')->get()->map(fn($item) => [
            'value' => $item->id,
            'label' => $item->name,
        ]);

        return inertia('Roles/Edit', [
            'page_setting' => [
                'title' => 'Edit Peran',
                'subtitle' => 'Edit Peran disini. Klik simpan setelah selesai',
                'method' => 'PUT',
                'action' => route('roles.update', $role)
            ],
            'permissions' => $permissions,
            'role' => $role->load('permissions'),
        ]);
    }

    public function update(RoleRequest $request, Role $role)
    {
        try {
            $role->update([
                'name' =>  $request->name,
            ]);
            $role->syncPermissions($request->permissions);

            flashMessage(MessageType::UPDATED->message('Role'));
            return to_route('roles.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('roles.index');
        }
    }

    public function destroy(Role $role)
    {
        try {
            if ($role->users()->count() > 0) {
                flashMessage('Tidak bisa menghapus peran ini. terdapat ' . $role->users()->count() . ' pengguna yang menggunakan peran ini. Jika peran ini dihapus, maka pengguna yang menggunakan peran ini akan otomatis terhapus', 'error');
                return back();
            }

            $role->delete();
            flashMessage(MessageType::DELETED->message('Peran'));
            return to_route('roles.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('roles.index');
        }
    }
}

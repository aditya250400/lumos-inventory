<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Throwable;

class UserController extends Controller
{

    public function index()
    {
        $users = User::query()
            ->with(['roles'])
            ->filter(request()->only(['search']))
            ->sorting(request()->only(['field', 'direction']))
            ->latest()
            ->paginate(request()->load ?? 10)
            ->withQueryString();

        return inertia('Users/Index', [
            'page_setting' => [
                'title' => 'Pengguna',
                'subtitle' => 'Menampilkan semua data pengguna',
            ],
            'users' => UserResource::collection($users)->additional([
                'meta' => [
                    'has_pages' => $users->hasPages(),
                ]
            ]),
            'state' => [
                'page' => request()->page ?? 1,
                'search' => request()->search ?? '',
                'load' => 10,
            ]
        ]);
    }

    public function create()
    {
        $roles = Role::query()->select(['name'])->orderBy('name')->get()->map(fn($item) => [
            'value' => $item->name,
            'label' => $item->name
        ]);

        return inertia('Users/Create', [
            'page_setting' => [
                'title' => 'Tambah Pengguna',
                'subtitle' => 'Buat pengguna baru di sini. Klik simpan setelah selesai',
                'method' => 'POST',
                'action' => route('users.store'),
            ],
            'roles' => $roles,
        ]);
    }

    public function store(UserRequest $request)
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->assignRole($request->role);

            flashMessage(MessageType::CREATED->message('Pengguna'));

            return to_route('users.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function edit(User $user)
    {
        $roles = Role::query()->select(['name'])->orderBy('name')->get()->map(fn($item) => [
            'value' => $item->name,
            'label' => $item->name
        ]);
        return inertia('Users/Edit', [
            'page_setting' => [
                'title' => 'Edit Pengguna',
                'subtitle' => 'Edit Pengguna di sini. Klik simpan setelah selesai',
                'method' => 'PUT',
                'action' => route('users.update', $user)
            ],
            'user' => $user->load('roles'),
            'role' => $user->getRoleNames()->first(),
            'roles' => $roles,

        ]);
    }

    public function update(UserRequest $request, User $user)
    {
        try {
            if ($request->password) {
                $user->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),

                ]);
            } else {

                $user->update([
                    'name' => $request->name,
                    'email' => $request->email,

                ]);
            }


            $user->syncRoles($request->role);

            flashMessage(MessageType::CREATED->message('Pengguna'));

            return to_route('users.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return back();
        }
    }

    public function destroy(User $user)
    {
        try {

            $user->delete();

            flashMessage(MessageType::DELETED->message('Pengguna'));

            return to_route('users.index');
        } catch (Throwable $e) {
            flashMessage(MessageType::ERROR->message(error: $e->getMessage()), 'error');
            return to_route('users.index');
        }
    }
}

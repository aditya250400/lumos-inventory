<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allPermissions = [
            'category.index',
            'category.create',
            'category.update',
            'category.delete',

            'location.index',
            'location.create',
            'location.update',
            'location.delete',

            'stock_opname.index',
            'stock_opname.create',
            'stock_opname.update',
            'stock_opname.delete',

            'tools.index',
            'tools.create',
            'tools.update',
            'tools.delete',

            'stock_opname_details.index',
            'stock_opname_details.create',
            'stock_opname_details.update',
            'stock_opname_details.delete',

            'loans.index',
            'loans.create',
            'loans.update',
            'loans.delete',

            'image.index',
            'image.create',
            'image.update',
            'image.delete',

            'tool_attribute.index',
            'tool_attribute.create',
            'tool_attribute.update',
            'tool_attribute.delete',

            'tool_attribute_values.index',
            'tool_attribute_values.create',
            'tool_attribute_values.update',
            'tool_attribute_values.delete',
        ];

        $withoutDelete = collect($allPermissions)
            ->reject(fn($permission) => str_ends_with($permission, '.delete'))
            ->values()
            ->toArray();

        // Koordinator Internal
        $koordinator = Role::firstOrCreate([
            'name' => 'Koordinator Internal',
            'guard_name' => 'web',
        ]);

        $koordinator->syncPermissions($allPermissions);

        // Owner
        $owner = Role::firstOrCreate([
            'name' => 'Owner',
            'guard_name' => 'web',
        ]);

        $owner->syncPermissions($allPermissions);

        // Teknisi
        $teknisi = Role::firstOrCreate([
            'name' => 'Teknisi',
            'guard_name' => 'web',
        ]);

        $teknisi->syncPermissions($withoutDelete);

        // Admin
        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions($withoutDelete);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}

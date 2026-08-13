<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Muhamad Rizki Aditya',
                'email' => 'muhamadrizkiaditya32@gmail.com',
                'role' => 'koordinator internal',
            ],
            [
                'name' => 'Indra Nurhaidir',
                'email' => 'indranurhaidir@gmail.com',
                'role' => 'teknisi',
            ],
            [
                'name' => 'Imam',
                'email' => 'imam@gmail.com',
                'role' => 'teknisi',
            ],
            [
                'name' => 'Endah',
                'email' => 'endah@gmail.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Ayu',
                'email' => 'ayu@gmail.com',
                'role' => 'admin',
            ],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                [
                    'email' => $data['email'],
                ],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                ]
            );

            $user->syncRoles([$data['role']]);
        }
    }
}

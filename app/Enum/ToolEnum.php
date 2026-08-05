<?php

namespace App\Enums;

enum ToolEnum: string
{
    case AVAILABLE = 'Tersedia';
    case UNAVAILABLE = 'Tidak Tersedia';
    case DAMAGE = 'Rusak';
    case LOAN = 'Dipinjam';
    case LOST = 'Hilang';

    public static function options()
    {
        return collect(self::cases())->map(fn($item) => [
            'value' => $item->value,
            'label' => $item->value,
        ])->values()->toArray();
    }
}

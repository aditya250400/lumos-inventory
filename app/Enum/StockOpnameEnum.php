<?php

namespace App\Enums;

enum StockOpnameEnum: string
{
    case MATCH = 'Cocok';
    case LESS = 'Kurang';
    case GREATER = 'Lebih';

    public static function options()
    {
        return collect(self::cases())->map(fn($item) => [
            'value' => $item->value,
            'label' => $item->value,
        ])->values()->toArray();
    }
}

<?php

namespace App\Enums;

enum StockOpnameEnum: string
{
    case DRAFT = 'Draft';
    case DONE = 'Selesai';

    public static function options()
    {
        return collect(self::cases())->map(fn($item) => [
            'value' => $item->value,
            'label' => $item->value,
        ])->values()->toArray();
    }
}

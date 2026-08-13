<?php

namespace App\Enums;

enum InventoryTypeEnum: string
{
    case INTERNAL = 'Internal';
    case EXTERNAL = 'Eksternal';

    public static function options()
    {
        return collect(self::cases())->map(fn($item) => [
            'value' => $item->value,
            'label' => $item->value,
        ])->values()->toArray();
    }
}

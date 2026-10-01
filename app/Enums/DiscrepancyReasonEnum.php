<?php

namespace App\Enums;

enum DiscrepancyReasonEnum: string
{
    case USED = 'Terpakai';
    case LOST = 'Hilang';
    case DAMAGE = 'Rusak';
    case NEWSTOCK = 'Stok Baru';

    public static function options()
    {
        return collect(self::cases())->map(fn($item) => [
            'value' => $item->value,
            'label' => $item->value,
        ])->values()->toArray();
    }
}

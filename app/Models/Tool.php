<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Image;
use Illuminate\Database\Eloquent\Builder;

class Tool extends Model
{
    protected $guarded = [];

    public function attributeValues()
    {
        return $this->hasMany(ToolAttributeValue::class);
    }

    public function images()
    {
        return $this->hasMany(Image::class);
    }

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function scopeFilter(Builder $query, $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereAny([
                'name',
                'tool_code',
                'status',
                'stock',
                'inventory_type'
            ], 'REGEXP', $search)
                ->orWhereHas('location', fn($query) => $query->whereAny(['name'], 'REGEXP', $search))
                ->orWhereHas('usedBy', fn($query) => $query->whereAny(['name', 'email'], 'REGEXP', $search))
                ->orWhereHas('category', fn($query) => $query->whereAny(['name'], 'REGEXP', $search))
            ;
        });
    }

    public function scopeSorting(Builder $query, $sorts)
    {
        $query->when($sorts['field'] ?? null && $sorts['direction'] ?? null, function ($query) use ($sorts) {
            $query->orderBy($sorts['field'], $sorts['direction']);
        });
    }
}

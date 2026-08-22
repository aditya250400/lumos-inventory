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

    public function scopeFilters(Builder $query, $filters)
    {
        $query
            ->when($filters['category'] ?? null, function ($query, $categorySlug) {
                $query->whereHas('category', function ($query) use ($categorySlug) {
                    $query->where('slug', $categorySlug);
                });
            })

            ->when($filters['location'] ?? null, function ($query, $locationSlug) {
                $query->whereHas('location', function ($query) use ($locationSlug) {
                    $query->where('slug', $locationSlug);
                });
            })

            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })

            ->when($filters['inventory_type'] ?? null, function ($query, $inventoryType) {
                $query->where('inventory_type', $inventoryType);
            })

            ->when($filters['used_by'] ?? null, function ($query, $userId) {
                $query->where('used_by', $userId);
            });
    }


    public function scopeSorting(Builder $query, $sorts)
    {
        $query->when($sorts['field'] ?? null && $sorts['direction'] ?? null, function ($query) use ($sorts) {
            $query->orderBy($sorts['field'], $sorts['direction']);
        });
    }
}

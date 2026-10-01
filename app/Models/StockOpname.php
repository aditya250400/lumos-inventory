<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $guarded = [];

    public function details()
    {
        return $this->hasMany(StockOpnameDetail::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function scopeFilters(Builder $query, $filters)
    {
        $query

            ->when($filters['location'] ?? null, function ($query, $locationSlug) {
                $query->whereHas('location', function ($query) use ($locationSlug) {
                    $query->where('slug', $locationSlug);
                });
            })

            ->when($filters['created_by'] ?? null, function ($query, $userId) {
                $query->where('created_by', $userId);
            })

            ->when($filters['date_from'] ?? null, function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })

            ->when($filters['date_to'] ?? null, function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            });;
    }


    public function scopeSorting(Builder $query, $sorts)
    {
        $query->when($sorts['field'] ?? null && $sorts['direction'] ?? null, function ($query) use ($sorts) {
            $query->orderBy($sorts['field'], $sorts['direction']);
        });
    }
}

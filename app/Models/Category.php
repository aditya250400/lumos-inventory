<?php

namespace App\Models;

use Cviebrock\EloquentSluggable\Sluggable;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use Sluggable;

    protected $guarded = [];

    public function tools()
    {
        return $this->hasMany(Tool::class);
    }

    public function toolAttributes()
    {
        return $this->hasMany(ToolAttribute::class);
    }

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name'
            ]
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Image;

class Tool extends Model
{
    protected $guarded = [];

    public function toolAttributeValues()
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
}

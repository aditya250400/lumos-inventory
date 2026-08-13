<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolAttribute extends Model
{
    protected $guarded = [];

    public function toolAttributeValues()
    {
        return $this->hasMany(ToolAttributeValue::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolAttribute extends Model
{
    protected $guarded = [];

    public function values()
    {
        return $this->hasMany(ToolAttributeValue::class, 'tool_attribute_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolAttributeValue extends Model
{
    protected $guarded = [];

    public function toolAttribute()
    {
        return $this->belongsTo(ToolAttribute::class);
    }

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}

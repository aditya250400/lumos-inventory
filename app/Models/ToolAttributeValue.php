<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolAttributeValue extends Model
{
    protected $guarded = [];

    public function attribute()
    {
        return $this->belongsTo(ToolAttribute::class, 'tool_attribute_id');
    }

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}

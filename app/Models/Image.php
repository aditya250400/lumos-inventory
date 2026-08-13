<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $guarded = [];

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}

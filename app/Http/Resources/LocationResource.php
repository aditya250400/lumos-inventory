<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'parent_id' => $this->parent_id,
            'tools_count' => ($this->tools_count ?? 0)
                + $this->children->sum('tools_count'),
            'tools_parent_count' => $this->tools_count,
            'children_count' => $this->children_count,
            'is_parent' => $this->children_count > 0,
            'total_stock' => ($this->tools_sum_stock ?? 0)
                + $this->children->sum('tools_sum_stock'),
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'name' => $this->parent->name,
                ];
            }),
            'children' => $this->children->map(fn($child) => [
                'id' => $child->id,
                'name' => $child->name,
                'user_id' => $child->user_id,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

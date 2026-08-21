<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'attributes' => ToolAttributeResource::collection(
                $this->whenLoaded('toolAttributes')
            ),
            'tools_count' => $this->tools_count ?? 0,
            'tools_sum_stock' => $this->tools_sum_stock ?? 0,
            'attribute_values_count' => $this->attribute_values_count,
            'toolAttributes_count' => $this->toolAttributes_count ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

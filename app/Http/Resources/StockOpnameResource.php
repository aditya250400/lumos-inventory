<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockOpnameResource extends JsonResource
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
            'difference_count' => $this->difference_count,
            'opname_date' => $this->opname_date,
            'note' => $this->note,
            'createdBy' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                ];
            }),
            'location' => $this->whenLoaded('location', function () {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                    'parent' => $this->location->relationLoaded('parent')
                        ? [
                            'id' => $this->location->parent?->id,
                            'name' => $this->location->parent?->name,
                        ]
                        : null,
                ];
            }),
        ];
    }
}

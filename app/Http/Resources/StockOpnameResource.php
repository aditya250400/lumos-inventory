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
            'created_at' => $this->created_at,
            'status' => $this->status,
            'note' => $this->note,
            'details' => $this->whenLoaded('details', fn() => $this->details->map(fn($detail) => [
                'id' => $detail->id,
                'tool_id' => $detail->tool_id,
                'tool_code' => $detail->tool->tool_code,
                'tool_name' => $detail->tool->name,
                'system_stock' => $detail->system_stock,
                'physical_stock' => $detail->physical_stock,
                'status' => $detail->status,
                'discrepancy_reason' => $detail->discrepancy_reason,
                'note' => $detail->note,
            ])),
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

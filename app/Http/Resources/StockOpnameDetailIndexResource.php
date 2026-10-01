<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockOpnameDetailIndexResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'note' => $this->note,

            'location' => $this->whenLoaded('location', fn() => [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ]),

            'created_by' => $this->whenLoaded('createdBy', fn() => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),

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
        ];
    }
}

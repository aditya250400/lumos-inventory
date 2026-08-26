<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ToolDetailResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'tool_code' => $this->tool_code,
            'name' => $this->name,
            'stock' => $this->stock,
            'inventory_type' => $this->inventory_type,
            'status' => $this->status,
            'note' => $this->note,

            'location' => $this->whenLoaded('location', function () {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                    'parent' => $this->location->relationLoaded('parent') && $this->location->parent
                        ? ['id' => $this->location->parent->id, 'name' => $this->location->parent->name]
                        : null,
                ];
            }),

            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),

            'used_by' => $this->whenLoaded('usedBy', fn() => $this->usedBy ? [
                'id' => $this->usedBy->id,
                'name' => $this->usedBy->name,
            ] : null),

            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($image) => [
                'id' => $image->id,
                'url' => asset('storage/' . $image->name),
                'is_primary' => $image->is_primary,
            ])),

            'attributes_show' => $this->whenLoaded('attributeValues', fn() => $this->attributeValues->map(fn($av) => [
                'field_name' => $av->attribute->field_name,
                'value' => $av->value,
            ])),
            'attributes' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->mapWithKeys(
                    fn($attributeValue) => [$attributeValue->attribute->field_name => $attributeValue->value]
                );
            }),

            'stock_opname_history' => $this->whenLoaded('stockOpnameDetails', fn() => $this->stockOpnameDetails->map(fn($detail) => [
                'id' => $detail->id,
                'date' => optional($detail->stockOpname)->opname_date,
                'system_stock' => $detail->system_stock,
                'physical_stock' => $detail->physical_stock,
                'difference' => $detail->system_stock - $detail->physical_stock,
                'status' => $detail->status,
                'note' => $detail->note,
            ])),

            'loan_history' => $this->whenLoaded('loans', fn() => $this->loans->map(fn($loan) => [
                'id' => $loan->id,
                'loan_code' => $loan->loan_code,
                'loan_by' => optional($loan->loanBy)->name,
                'loan_date' => $loan->loan_date,
                'return_date' => $loan->return_date,
                'status' => $loan->status,
            ])),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

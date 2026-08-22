<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ToolsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'tool_code' => $this->tool_code,
            'name' => $this->name,
            'stock' => $this->stock,
            'inventory_type' => $this->inventory_type,
            'status' => $this->status,
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
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ];
            }),
            'used_by' => $this->whenLoaded('usedBy', function () {
                return [
                    'id' => $this->usedBy->id,
                    'name' => $this->usedBy->name,
                ];
            }),


            // foto utama (is_primary) dipakai buat card grid, fallback ke foto pertama kalau
            // gak ada yang ditandai primary, null kalau emang belum ada foto sama sekali
            'primary_image' => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $primary ? asset('storage/' . $primary->name) : null;
            }),

            // di-map jadi { "Kapasitas": "1TB", "Interface": "NVMe" } biar gampang dipakai
            // sebagai kolom dinamis di tabel (lihat diskusi attrMap sebelumnya)
            'attributes' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->mapWithKeys(
                    fn($attributeValue) => [$attributeValue->attribute->field_name => $attributeValue->value]
                );
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

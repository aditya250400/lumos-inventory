<?php

namespace App\Http\Requests;

use App\Enums\InventoryTypeEnum;
use App\Enums\ToolEnum;
use App\Enums\ToolStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'name' => ['required', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'inventory_type' => ['required', Rule::enum(InventoryTypeEnum::class)],
            'status' => ['required', Rule::enum(ToolEnum::class)],
            'used_by' => ['nullable', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],

            // Attribut dinamis sesuai kategori yang dipilih
            'attributes' => ['nullable', 'array'],
            'attributes.*.tool_attribute_id' => ['required', 'integer', 'exists:tool_attributes,id'],
            'attributes.*.value' => ['nullable', 'string', 'max:255'],

            // Foto: campuran foto lama (type=existing, punya id) dan foto baru (type=new, punya file)
            'images' => ['nullable', 'array'],
            'images.*.type' => ['required', Rule::in(['existing', 'new'])],
            'images.*.id' => ['required_if:images.*.type,existing', 'integer', 'exists:images,id'],
            'images.*.file' => ['required_if:images.*.type,new', 'file', 'image', 'max:5120'],
            'images.*.is_primary' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama tool wajib diisi.',
            'inventory_type.required' => 'Tipe inventori wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'location_id.required' => 'Lokasi wajib dipilih.',
            'images.*.file.image' => 'File yang diupload harus berupa gambar.',
            'images.*.file.max' => 'Ukuran foto maksimal 5MB.',
        ];
    }
}

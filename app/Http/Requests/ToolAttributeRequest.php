<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ToolAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');
        $attribute = $this->route('attribute');

        return [
            'field_name' => [
                'required',
                'string',
                'min:3',
                'max:20',

                Rule::unique('tool_attributes', 'field_name')
                    ->where(
                        fn($query) => $query->where('category_id', $category->id)
                    )
                    ->ignore($attribute?->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'field_name.required' => 'Isi nama attributenya.',
            'field_name.max' => 'Nama attribute maksimal 20 karakter.',
            'field_name.min' => 'Nama attribute minimal 3 karakter.',
            'field_name.unique' => 'Attribute ini sudah digunakan pada kategori ini.',
        ];
    }
}

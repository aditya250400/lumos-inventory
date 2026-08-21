<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Illuminate\Support\Str;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'min:3',
                'max:20',
                Rule::unique('categories', 'name')->ignore($category?->id),
            ],

            'attributes' => [
                'nullable',
                'array',
            ],

            'attributes.*.id' => [
                'nullable',
                'integer',
                Rule::exists('tool_attributes', 'id')
                    ->where('category_id', $category?->id),
            ],

            'attributes.*.field_name' => [
                'required',
                'string',
                'max:255',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $attributes = $this->input('attributes', []);

            $seen = [];

            foreach ($attributes as $index => $attribute) {
                $name = Str::lower(trim($attribute['field_name'] ?? ''));

                if ($name === '') {
                    continue;
                }

                if (in_array($name, $seen, true)) {
                    $validator->errors()->add(
                        "attributes.{$index}.field_name",
                        'Attribute ini sudah dipakai di daftar yang sama.'
                    );
                }

                $seen[] = $name;
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Isi nama kategorinya.',
            'name.min' => 'Nama kategori minimal 3 karakter.',
            'name.max' => 'Nama kategori maksimal 20 karakter.',
            'name.unique' => 'Nama kategori ini sudah dipakai.',

            'attributes.*.id.exists' => 'Attribute tidak valid untuk kategori ini.',

            'attributes.*.field_name.required' => 'Attribute wajib diisi.',
            'attributes.*.field_name.max' => 'Nama Attribute maksimal 255 karakter.',
        ];
    }
}

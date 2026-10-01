<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StockOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // sebelumnya `false` -> semua request bakal ke-reject 403
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'note' => ['nullable', 'string', 'max:1000'],

            // cuma relevan kalau location_id yang dipilih adalah lokasi induk (punya children)
            'include_children' => ['nullable', 'boolean'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Route model binding:
        // - Create: {location} = lokasi induk (dari URL /locations/{location}/sub-locations)
        // - Update: {subLocation} = sub lokasi yang lagi diedit
        $subLocation = $this->route('subLocation');
        $parentId = $subLocation?->parent_id ?? $this->route('location')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // Unique-nya di-scope ke parent_id yang sama, biar "Meja Rizki" di
                // lokasi lain tetap boleh dipakai.
                Rule::unique('locations', 'name')
                    ->where(fn($query) => $query->where('parent_id', $parentId))
                    ->ignore($subLocation?->id),
            ],
            'has_owner' => ['boolean'],
            'user_id' => [
                'nullable',
                'required_if:has_owner,true',
                'exists:users,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Isi nama sub lokasinya.',
            'name.unique' => 'Nama sub lokasi ini sudah dipakai di lokasi ini.',
            'user_id.required_if' => 'Pilih pemilik sub lokasi ini.',
        ];
    }
}

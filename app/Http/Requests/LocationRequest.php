<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class LocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Route model binding: {location} ada di route pas update, kosong pas store.
        // Dipakai buat "ignore" record ini sendiri dari pengecekan unique.
        $location = $this->route('location');

        // Saat update, sub lokasi baru/lama nempel ke parent_id = id lokasi ini.
        // Saat store, parent-nya belum ada di database (baru mau dibuat), jadi
        // gak ada row lama yang perlu di-cek — cukup dijaga lewat withValidator()
        // di bawah (cek duplikat sesama item dalam 1 payload yang sama).
        $parentId = $location?->id;

        $rules = [
            'name' => [
                'required',
                'string',
                'max:20',
                'min:3',
                Rule::unique('locations', 'name')->ignore($location?->id),
            ],

            'sub_locations' => ['nullable', 'array'],
            'sub_locations.*.id' => ['nullable', 'integer', 'exists:locations,id'],
            'sub_locations.*.has_owner' => ['boolean'],
            'sub_locations.*.user_id' => [
                'nullable',
                'required_if:sub_locations.*.has_owner,true',
                'exists:users,id',
            ],
        ];

        // Rule unique per index dibangun manual (bukan pakai wildcard 'sub_locations.*.name')
        // supaya tiap sub lokasi bisa di-"ignore" dari pengecekan unique pakai id-nya masing-masing.
        foreach ($this->input('sub_locations', []) as $index => $sub) {
            $nameRule = ['required', 'string', 'max:255'];

            // Scope: unique-nya cuma dibandingkan ke sub lokasi lain yang parent_id-nya SAMA.
            // Jadi "Meja Rizki" di Maranatha dan "Meja Rizki" di Kembar dua-duanya boleh ada.
            if ($parentId) {
                $nameRule[] = Rule::unique('locations', 'name')
                    ->where(fn($query) => $query->where('parent_id', $parentId))
                    ->ignore($sub['id'] ?? null);
            }

            $rules["sub_locations.{$index}.name"] = $nameRule;
        }

        return $rules;
    }

    /**
     * Validasi tambahan yang gak bisa dicek lewat rules() biasa:
     * duplikat nama sub lokasi DI DALAM satu payload yang sama (misal user
     * ngetik "Meja Rizki" dua kali sebelum sempat kesimpan ke database).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $seen = [];

            foreach ($this->input('sub_locations', []) as $index => $sub) {
                $name = Str::lower(trim($sub['name'] ?? ''));

                if ($name === '') {
                    continue;
                }

                if (in_array($name, $seen, true)) {
                    $validator->errors()->add(
                        "sub_locations.{$index}.name",
                        'Nama sub lokasi ini sudah dipakai di daftar yang sama.'
                    );
                }

                $seen[] = $name;
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Isi nama lokasinya.',
            'name.min' => 'Nama lokasi minimal 3 karakter.',
            'name.max' => 'Nama lokasi maksimal 20 karakter.',
            'name.unique' => 'Nama lokasi ini sudah dipakai.',
            'sub_locations.*.name.unique' => 'Nama sub lokasi ini sudah dipakai di lokasi ini.',
            'sub_locations.*.name.required' => 'Nama sub lokasi wajib diisi.',
            'sub_locations.*.user_id.required_if' => 'Pilih pemilik sub lokasi ini.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockOpnameDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $stockOpname = $this->route('stockOpname');

        return [
            'details' => ['required', 'array', 'min:1'],

            'details.*.id' => [
                'required',
                'integer',
                Rule::exists('stock_opname_details', 'id')
                    ->where('stock_opname_id', $stockOpname->id),
            ],

            'details.*.physical_stock' => [
                'required',
                'integer',
                'min:0',
            ],

            'details.*.discrepancy_reason' => [
                'nullable',
                'string',
                Rule::in([
                    'Terpakai',
                    'Hilang',
                    'Rusak',
                    'Stok Baru',
                ]),
            ],

            'details.*.note' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            foreach ($this->input('details', []) as $index => $detail) {
                $stockOpnameDetail = \App\Models\StockOpnameDetail::find($detail['id'] ?? null);

                if (!$stockOpnameDetail) {
                    continue;
                }

                $systemStock = (int) $stockOpnameDetail->system_stock;
                $physicalStock = (int) ($detail['physical_stock'] ?? 0);

                // Ada selisih, alasan wajib diisi
                if ($systemStock !== $physicalStock) {
                    if (empty($detail['discrepancy_reason'])) {
                        $validator->errors()->add(
                            "details.{$index}.discrepancy_reason",
                            'Alasan perbedaan stok wajib diisi.'
                        );
                    }
                }

                // Tidak ada selisih, alasan harus kosong
                if ($systemStock === $physicalStock && !empty($detail['discrepancy_reason'])) {
                    $validator->errors()->add(
                        "details.{$index}.discrepancy_reason",
                        'Alasan perbedaan stok harus kosong jika tidak ada selisih.'
                    );
                }
            }
        });
    }
}

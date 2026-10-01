<?php

namespace App\Http\Controllers;

use App\Enums\DiscrepancyReasonEnum;
use App\Enums\ToolEnum;
use App\Http\Requests\StockOpnameDetailRequest;
use App\Http\Resources\StockOpnameDetailIndexResource;
use App\Models\StockOpname;
use App\Models\StockOpnameDetail;
use App\Models\Tool;
use Illuminate\Support\Facades\DB;

class StockOpnameDetailController extends Controller
{
    /**
     * Route: Route::put('stock-opnames/{stockOpname}/details', [StockOpnameDetailController::class, 'update'])
     *     ->name('stock-opnames.details.update');
     *
     * Sama seperti store() di StockOpnameController, ini juga return JSON, bukan Inertia
     * response — dipanggil dari dalam modal (step 2), bukan navigasi halaman.
     *
     * Dipakai oleh DUA tombol yang sama (Simpan Draft & Selesaikan Opname) — bedanya
     * cuma di frontend (tutup modal atau enggak), backend-nya melakukan hal yang sama.
     */
    public function update(StockOpnameDetailRequest $request, StockOpname $stockOpname)
    {

        DB::transaction(function () use ($request, $stockOpname) {

            $stockOpname->update([
                'status' => $request->draft ? 'Draft' : 'Selesai',
            ]);



            foreach ($request->details as $row) {
                $detail = StockOpnameDetail::where('stock_opname_id', $stockOpname->id)
                    ->whereKey($row['id'])
                    ->firstOrFail();


                $detail->update([
                    'physical_stock' => $row['physical_stock'],
                    'note' => $row['note'] ?? null,
                    'status' => $detail->system_stock == $row['physical_stock'] ? 'Sesuai' : 'Tidak Sesuai',
                    'discrepancy_reason' => $row['discrepancy_reason'],
                ]);

                // update stok hanya ketika status stock opname selesai dan bukan draft
                if (!$request->draft) {
                    $toolStatus = match ($row['discrepancy_reason']) {
                        DiscrepancyReasonEnum::USED->value => ToolEnum::AVAILABLE->value,
                        DiscrepancyReasonEnum::DAMAGE->value => ToolEnum::DAMAGE->value,
                        DiscrepancyReasonEnum::LOST->value => ToolEnum::LOST->value,
                        DiscrepancyReasonEnum::NEWSTOCK->value => ToolEnum::AVAILABLE->value,
                        default => ToolEnum::AVAILABLE->value,
                    };

                    $detail->tool()->update([
                        'stock' => $row['physical_stock'],
                        'status' => $toolStatus
                    ]);
                }
            }
        });

        $stockOpname->load(['details.tool', 'location', 'createdBy']);

        // return response()->json([
        //     'stock_opname' => new StockOpnameDetailIndexResource($stockOpname),
        // ]);

        return back();
    }
}

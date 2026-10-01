import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ClientPagination, { useClientPagination } from './ClientPagination';

function statusBadgeClass(status) {
    if (status === 'Sesuai') {
        return 'bg-green-50 text-green-700';
    }

    return 'bg-red-50 text-red-700';
}

export default function StockOpnameModal({
    open,
    onOpenChange,
    locations,
    discrepancy_reasons,
    stepOpname,
    setStepOpname,
    stockOpname,
    setStockOpname,
    rows,
    setRows,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    // ---- Step 1 state ----
    // step 2 nya ada di parent (stockOpname/index.jsx)
    const [locationId, setLocationId] = useState('');
    const [note, setNote] = useState('');

    // untuk pagination
    const tools = useClientPagination(rows ?? [], 50);

    // Reset total tiap modal ditutup, biar kalau dibuka lagi mulai dari step 1 yang bersih

    const onReset = () => {
        setStepOpname(1);
        setLocationId('');
        setNote('');
        setStockOpname(null);
        setRows([]);
        setErrors({});
    };
    useEffect(() => {
        if (!open) {
            onReset();
        }
    }, [open]);

    // cancel

    const handleCancelConfirmation = () => {
        setShowCancelConfirmation(false);
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirmation(false);
        onOpenChange(false);
        onReset();
    };

    const handleStartOpname = async () => {
        setSubmitting(true);
        setErrors({});

        try {
            const { data } = await axios.post(route('stock-opnames.store'), {
                location_id: locationId,
                note,
            });

            setStockOpname(data.stock_opname);
            setRows(data.stock_opname.details);
            setStepOpname(2);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors ?? { location_id: [error.response.data.message] });
            } else {
                toast.error('Gagal memulai stock opname, coba lagi.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const updateRow = (id, field, value) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const saveDetails = (isDraft) => {
        setSubmitting(true);
        setErrors({});

        router.put(
            route('stock-opnames.details.update', [stockOpname.id]),
            {
                details: rows.map((row) => ({
                    id: row.id,
                    physical_stock: row.physical_stock,
                    system_stock: row.physical_stock,
                    note: row.note,
                    discrepancy_reason: row.discrepancy_reason,
                })),
                draft: isDraft,
            },
            {
                onSuccess: () => {
                    toast.success(isDraft ? 'Draft berhasil disimpan' : 'Stock opname selesai disimpan');
                    onOpenChange(false);
                    setStepOpname(1);
                    setLocationId('');
                    setNote('');
                    setStockOpname(null);
                    setRows([]);
                    setErrors({});
                    setSubmitting(false);
                },
                onError: (errors) => {
                    setSubmitting(false);

                    console.error(errors);

                    const discrepancyError = Object.entries(errors).find(([key]) =>
                        key.endsWith('.discrepancy_reason'),
                    );

                    if (discrepancyError) {
                        toast.error(discrepancyError[1]);
                        return;
                    }

                    const firstError = Object.values(errors)[0];

                    toast.error(firstError ?? 'Gagal menyimpan, coba lagi');
                },
            },
        );
    };

    const differenceCount = rows.filter((r) => Number(r.system_stock) !== Number(r.physical_stock)).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onInteractOutside={(event) => event.preventDefault()}
                className="max-h-[90vh] overflow-y-auto sm:max-w-4xl [&>button]:hidden"
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                {stepOpname === 1 ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Mulai Stock Opname</DialogTitle>
                            <DialogDescription>Pilih lokasi yang mau dicek dan catatan opsional.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Lokasi</Label>
                                <Select value={locationId} onValueChange={setLocationId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih lokasi yang mau dicek" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={String(location.id)}>
                                                {location.name}
                                                {location.parent?.name && ` (${location.parent.name})`}
                                                {' — '}
                                                {location.tools_count ?? 0} tool
                                                {location.children_count > 0 &&
                                                    ` (induk, ${location.children_count} sub-lokasi)`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.location_id && <p className="text-sm text-red-500">{errors.location_id[0]}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Catatan (opsional)</Label>
                                <Textarea
                                    placeholder="Contoh: opname rutin bulanan"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                tabIndex={-1}

                                type="button"
                                variant="outline"
                                onClick={() => setShowCancelConfirmation(true)}
                                disabled={submitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="blue"
                                disabled={!locationId || submitting}
                                onClick={handleStartOpname}
                                className="disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Memuat...' : 'Lanjut → Isi Stok Fisik'}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Isi Stok Fisik — {stockOpname.location?.name}</DialogTitle>
                            <DialogDescription>
                                {rows.length} tool dicek
                                {differenceCount > 0 && (
                                    <span className="ml-2 font-semibold text-red-600">
                                        {differenceCount} tool yang memiliki selisih
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="max-h-[50vh] overflow-y-auto py-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Tool</TableHead>
                                        <TableHead>Stok Sistem</TableHead>
                                        <TableHead>Stok Fisik</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Alasan Perbedaan Stok</TableHead>
                                        <TableHead>Catatan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tools.pagedItems.map((row, index) => {
                                        const systemStock = Number(row.system_stock);
                                        const physicalStock = Number(row.physical_stock);
                                        const difference = physicalStock - systemStock;

                                        const mismatch = Number(row.system_stock) !== Number(row.physical_stock);
                                        const status =
                                            difference === 0
                                                ? 'Sesuai'
                                                : difference < 0
                                                  ? `Kurang ${Math.abs(difference)}`
                                                  : `Lebih ${difference}`;
                                        return (
                                            <TableRow key={row.id} className={mismatch ? 'bg-red-50/50' : ''}>
                                                <TableCell>{(tools.page - 1) * tools.perPage + index + 1}</TableCell>
                                                <TableCell>{row.tool_code}</TableCell>
                                                <TableCell>{row.tool_name}</TableCell>
                                                <TableCell>{row.system_stock}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        className="w-20"
                                                        value={row.physical_stock}
                                                        onChange={(e) => {
                                                            const newPhysicalStock = e.target.value;
                                                            const newStatus =
                                                                Number(newPhysicalStock) === Number(row.system_stock)
                                                                    ? 'Sesuai'
                                                                    : 'Tidak Sesuai';

                                                            setRows((prev) =>
                                                                prev.map((item) =>
                                                                    item.id === row.id
                                                                        ? {
                                                                              ...item,
                                                                              physical_stock: newPhysicalStock,
                                                                              discrepancy_reason:
                                                                                  newStatus === 'Sesuai'
                                                                                      ? ''
                                                                                      : item.discrepancy_reason,
                                                                          }
                                                                        : item,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(
                                                            status,
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        disabled={status == 'Sesuai'}
                                                        value={
                                                            status === 'Sesuai' ? '' : (row.discrepancy_reason ?? '')
                                                        }
                                                        onValueChange={(value) =>
                                                            updateRow(row.id, 'discrepancy_reason', value)
                                                        }
                                                    >
                                                        <SelectTrigger className="xl:w-fit">
                                                            <SelectValue placeholder="Pilih Alasan" />
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {discrepancy_reasons.map((reason, i) => (
                                                                <SelectItem key={i} value={String(reason.value)}>
                                                                    {reason.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        className="w-40"
                                                        placeholder="-"
                                                        value={row.note ?? ''}
                                                        onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <ClientPagination
                                page={tools.page}
                                setPage={tools.setPage}
                                totalPages={tools.totalPages}
                                total={tools.total}
                                from={tools.from}
                                to={tools.to}
                                label="Riwayat Stock Opname"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={submitting}
                                onClick={() => saveDetails(true)}
                            >
                                Simpan Draft
                            </Button>
                            <Button
                                type="button"
                                variant="blue"
                                disabled={submitting}
                                onClick={() => saveDetails(false)}
                            >
                                Selesaikan Opname
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>

            {/* cancel */}

            <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Batalkan pengisian?</DialogTitle>

                        <DialogDescription>
                            Semua inputan stock opname mungkin ada yang tidak akan tersimpan
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancelConfirmation}>
                            Kembali
                        </Button>

                        <Button type="button" variant="destructive" onClick={handleConfirmCancel}>
                            Ya, Batalkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

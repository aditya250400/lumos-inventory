import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { formatDateIndo } from '@/lib/utils';
import { IconDownload, IconFilter, IconPdf, IconPrinter } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ToolStatusBadge from './ToolStatusBadge';
import ClientPagination, { useClientPagination } from './ClientPagination';

export default function StockOpnameDetailModal({ open, onOpenChange, stockOpname }) {
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

    const allDetails = stockOpname?.details ?? [];

    const differenceDetails = allDetails.filter(
        (detail) => Number(detail.physical_stock) !== Number(detail.system_stock),
    );

    const filteredDetails = showDifferencesOnly ? differenceDetails : allDetails;

    const pagination = useClientPagination(filteredDetails, 50);

    // Reset filter dan pagination ketika modal dibuka dengan stock opname berbeda
    useEffect(() => {
        if (open) {
            setShowDifferencesOnly(false);
        }
    }, [stockOpname?.id, open]);

    if (!stockOpname) {
        return null;
    }

    const details = pagination.pagedItems;

    const locationName = stockOpname.location
        ? stockOpname.location.parent?.name
            ? `${stockOpname.location.name} (${stockOpname.location.parent.name})`
            : stockOpname.location.name
        : '-';

    const differenceCount = differenceDetails.length;

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                onOpenChange(value);

                if (!value) {
                    setShowDifferencesOnly(false);
                }
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <DialogTitle className="text-xl">
                                Detail Stock Opname {locationName} - {formatDateIndo(stockOpname.created_at)}
                            </DialogTitle>

                            <DialogDescription className="mt-1">
                                Detail pemeriksaan stok fisik pada lokasi {locationName}.
                            </DialogDescription>
                        </div>

                        <Button type="button" variant="slate" onClick={() => alert('Cetak')} className="shrink-0">
                            <IconDownload className="size-4" />
                            Download PDF
                        </Button>
                    </div>
                </DialogHeader>

                {/* SUMMARY */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Dibuat Oleh</p>

                        <p className="mt-1 font-semibold">{stockOpname.createdBy.name}</p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Lokasi</p>

                        <p className="mt-1 font-semibold">{locationName}</p>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Status</p>

                        <div className="mt-1">
                            <ToolStatusBadge status={stockOpname.status} />
                        </div>
                    </div>

                    <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Selisih</p>

                        <p className={`mt-1 font-semibold ${differenceCount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {differenceCount > 0 ? `${differenceCount} tool` : 'Tidak ada selisih'}
                        </p>
                    </div>
                </div>

                {/* NOTE */}
                {stockOpname.note && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground">Catatan Stock Opname</p>

                        <p className="mt-1 whitespace-pre-wrap text-sm">{stockOpname.note}</p>
                    </div>
                )}

                {/* FILTER */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        variant={showDifferencesOnly ? 'slate' : 'outline'}
                        size="sm"
                        disabled={differenceCount === 0}
                        onClick={() => {
                            setShowDifferencesOnly((current) => !current);
                        }}
                    >
                        <IconFilter className="size-4" />

                        {showDifferencesOnly
                            ? 'Tampilkan Semua'
                            : `Tampilkan Selisih${differenceCount > 0 ? ` (${differenceCount})` : ''}`}
                    </Button>
                </div>

                {/* TABLE */}
                <div className="max-h-[50vh] overflow-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4">No</TableHead>
                                <TableHead>Kode Tool</TableHead>
                                <TableHead>Nama Tool</TableHead>
                                <TableHead className="text-center">Stok Sistem</TableHead>
                                <TableHead className="text-center">Stok Fisik</TableHead>
                                <TableHead className="text-center">Selisih</TableHead>
                                <TableHead>Alasan Perbedaan Stok</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {details.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                                        {showDifferencesOnly
                                            ? 'Tidak ada tool yang memiliki selisih.'
                                            : 'Tidak ada detail stock opname.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                details.map((detail, index) => {
                                    const difference = Number(detail.physical_stock) - Number(detail.system_stock);

                                    return (
                                        <TableRow key={detail.id}>
                                            <TableCell className="px-4">{pagination.from + index}</TableCell>

                                            <TableCell className="font-medium">{detail.tool_code}</TableCell>

                                            <TableCell>{detail.tool_name}</TableCell>

                                            <TableCell className="text-center">{detail.system_stock}</TableCell>

                                            <TableCell className="text-center">{detail.physical_stock}</TableCell>

                                            <TableCell
                                                className={`text-center font-semibold ${
                                                    difference === 0 ? 'text-green-600' : 'text-red-500'
                                                }`}
                                            >
                                                {difference === 0
                                                    ? 'Tidak ada selisih'
                                                    : difference < 0
                                                      ? `Kurang ${Math.abs(difference)}`
                                                      : `Lebih ${difference}`}
                                            </TableCell>

                                            <TableCell>{detail.discrepancy_reason ?? '-'}</TableCell>

                                            <TableCell>{detail.note ?? '-'}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION */}
                <ClientPagination
                    page={pagination.page}
                    setPage={pagination.setPage}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    from={pagination.from}
                    to={pagination.to}
                    perPage={pagination.perPage}
                    label={showDifferencesOnly ? 'tool berselisih' : 'tool'}
                />

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import AlertAction from '@/Components/AlertAction';
import EditToolModal from '@/Components/EditToolModal';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconChevronLeft,
    IconChevronRight,
    IconPencil,
    IconPhoto,
    IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const PER_PAGE = 5;

function usePagedList(items) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));

    const paged = useMemo(() => items.slice((page - 1) * PER_PAGE, page * PER_PAGE), [items, page]);

    return {
        page,
        setPage,
        totalPages,
        paged,
    };
}

function TablePagination({ page, setPage, totalPages, total, label }) {
    if (total === 0) return null;

    return (
        <div className="flex flex-col items-center justify-between gap-y-2 border-t px-4 py-3 lg:flex-row">
            <p className="text-sm text-muted-foreground">
                Menampilkan {total === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} dari{' '}
                {total} {label}
            </p>

            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        <IconChevronLeft className="size-4" />
                    </Button>

                    <span className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white">{page}</span>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <IconChevronRight className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function Show({ auth, tool, users, categories, locations, inventory_types, statuses }) {
    const opname = usePagedList(tool.stock_opname_history ?? []);

    const loans = usePagedList(tool.loan_history ?? []);

    /*
     * ============================================================
     * IMAGES
     * ============================================================
     */

    const images = tool.images ?? [];

    const primaryImageIndex = Math.max(
        0,
        images.findIndex((image) => image.is_primary),
    );

    const primaryImage = images[primaryImageIndex] ?? images[0] ?? null;

    /*
     * ============================================================
     * EDIT
     * ============================================================
     */

    const [editOpen, setEditOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    const onEditTrigger = (tool) => {
        setSelectedTool(tool);
        setEditOpen(true);
    };

    /*
     * ============================================================
     * IMAGE VIEWER
     * ============================================================
     */

    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    const thumbnailContainerRef = useRef(null);

    const imageViewerOpen = selectedImageIndex !== null;

    /*
     * ============================================================
     * OPEN IMAGE
     * ============================================================
     */

    const openImageViewer = (index) => {
        if (images.length === 0) return;

        setSelectedImageIndex(index);
    };

    /*
     * ============================================================
     * CLOSE IMAGE
     * ============================================================
     */

    const closeImageViewer = () => {
        setSelectedImageIndex(null);
    };

    /*
     * ============================================================
     * PREVIOUS IMAGE
     * ============================================================
     */

    const showPreviousImage = () => {
        setSelectedImageIndex((current) => {
            if (current === null || images.length === 0) {
                return current;
            }

            return current === 0 ? images.length - 1 : current - 1;
        });
    };

    /*
     * ============================================================
     * NEXT IMAGE
     * ============================================================
     */

    const showNextImage = () => {
        setSelectedImageIndex((current) => {
            if (current === null || images.length === 0) {
                return current;
            }

            return current === images.length - 1 ? 0 : current + 1;
        });
    };

    /*
     * ============================================================
     * SCROLL THUMBNAILS
     * ============================================================
     */

    const scrollThumbnails = (direction) => {
        if (!thumbnailContainerRef.current) {
            return;
        }

        thumbnailContainerRef.current.scrollBy({
            left: direction === 'left' ? -220 : 220,
            behavior: 'smooth',
        });
    };

    /*
     * ============================================================
     * KEYBOARD NAVIGATION
     * ============================================================
     */

    useEffect(() => {
        if (!imageViewerOpen) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPreviousImage();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNextImage();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeImageViewer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [imageViewerOpen]);

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="mb-4 flex flex-col items-start justify-between gap-y-3 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{tool.name}</h1>

                        <div className="mt-2 flex flex-wrap gap-2">
                            <Badge>{tool.tool_code}</Badge>

                            <Badge>{tool.inventory_type === 'internal' ? 'Internal' : 'Eksternal'}</Badge>

                            <Badge>{tool.status}</Badge>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {hasAnyPermissions(auth.permissions, ['tools.update']) && (
                            <Button onClick={() => onEditTrigger(tool)} variant="blue" size="sm">
                                <IconPencil className="size-4" />
                                Edit
                            </Button>
                        )}

                        <Button asChild variant="blue" size="sm" className="w-full lg:w-auto">
                            <Link href={route('tools.index')}>
                                <IconArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* =================================================
                    MAIN CONTENT
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* =================================================
                        FOTO
                    ================================================== */}

                    <Card>
                        <CardContent className="pt-6">
                            {primaryImage ? (
                                <>
                                    {/* ===============================
                                        PRIMARY IMAGE
                                    ================================ */}

                                    <button
                                        type="button"
                                        onClick={() => openImageViewer(primaryImageIndex)}
                                        className="group mb-3 block h-64 w-full overflow-hidden rounded-lg"
                                        title="Klik untuk melihat foto"
                                    >
                                        <img
                                            src={primaryImage.url}
                                            alt={tool.name}
                                            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02] group-hover:opacity-90"
                                        />
                                    </button>

                                    {/* ===============================
                                        THUMBNAILS
                                    ================================ */}

                                    {images.length > 1 && (
                                        <div className="flex items-center gap-2">
                                            {/* PANAH KIRI */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-9 shrink-0"
                                                onClick={() => scrollThumbnails('left')}
                                                aria-label="Scroll thumbnail ke kiri"
                                            >
                                                <IconChevronLeft className="size-4" />
                                            </Button>

                                            {/* THUMBNAIL LIST */}
                                            <div
                                                ref={thumbnailContainerRef}
                                                className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                            >
                                                {images.map((img, index) => (
                                                    <button
                                                        key={img.id}
                                                        type="button"
                                                        onClick={() => openImageViewer(index)}
                                                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                                                            index === primaryImageIndex
                                                                ? 'border-blue-500'
                                                                : 'border-transparent hover:border-gray-300'
                                                        }`}
                                                        title="Lihat foto"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={`${tool.name} ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />

                                                        {/* PRIMARY BADGE */}
                                                        {img.is_primary && (
                                                            <span className="absolute bottom-0 left-0 right-0 bg-blue-500/90 px-1 py-0.5 text-[9px] font-medium text-white">
                                                                Utama
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* PANAH KANAN */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-9 shrink-0"
                                                onClick={() => scrollThumbnails('right')}
                                                aria-label="Scroll thumbnail ke kanan"
                                            >
                                                <IconChevronRight className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted">
                                    <IconPhoto className="size-10 text-muted-foreground/50" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* =================================================
                        INFO KANAN
                    ================================================== */}

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InfoBox
                                label="Lokasi"
                                value={
                                    tool.location
                                        ? tool.location.parent?.name
                                            ? `${tool.location.name} (${tool.location.parent.name})`
                                            : tool.location.name
                                        : '-'
                                }
                            />

                            <InfoBox label="Stok" value={`${tool.stock} Unit`} />

                            <InfoBox label="Digunakan Oleh" value={tool.used_by?.name ?? 'Semua Staff'} />

                            <InfoBox label="Kategori" value={tool.category?.name ?? '-'} />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* ATRIBUT */}
                            <Card>
                                <CardContent className="pt-4">
                                    <p className="mb-2 text-sm font-semibold">
                                        Atribut Kategori &quot;
                                        {tool.category?.name}
                                        &quot;
                                    </p>

                                    <div className="scroll-bar max-h-40 space-y-2 overflow-y-auto pr-1">
                                        {(tool.attributes_show ?? []).length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Tidak ada atribut</p>
                                        ) : (
                                            tool.attributes_show.map((attr) => (
                                                <div key={attr.field_name} className="text-sm">
                                                    <p className="text-muted-foreground">{attr.field_name}</p>

                                                    <p className="font-medium">{attr.value || '-'}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CATATAN */}
                            <Card>
                                <CardContent className="pt-4">
                                    <p className="mb-2 text-sm font-semibold">Catatan</p>

                                    <div className="max-h-40 overflow-y-auto pr-1">
                                        <p className="whitespace-pre-wrap break-words text-sm">{tool.note || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    RIWAYAT STOCK OPNAME
                ================================================== */}

                <Card className="mt-6">
                    <CardContent className="p-0">
                        <p className="p-4 text-sm font-semibold">Riwayat Stock Opname</p>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">#</TableHead>

                                    <TableHead>Tanggal</TableHead>

                                    <TableHead>Stok Sistem</TableHead>

                                    <TableHead>Stok Fisik</TableHead>

                                    <TableHead>Selisih</TableHead>

                                    <TableHead>Status</TableHead>

                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {opname.paged.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                                            Belum ada riwayat stock opname
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    opname.paged.map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4">
                                                {(opname.page - 1) * PER_PAGE + index + 1}
                                            </TableCell>

                                            <TableCell>{formatDateIndo(row.date)}</TableCell>

                                            <TableCell>{row.system_stock}</TableCell>

                                            <TableCell>{row.physical_stock}</TableCell>

                                            <TableCell>{row.difference}</TableCell>

                                            <TableCell>{row.status}</TableCell>

                                            <TableCell>{row.note || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            page={opname.page}
                            setPage={opname.setPage}
                            totalPages={opname.totalPages}
                            total={(tool.stock_opname_history ?? []).length}
                            label="Riwayat Stock Opname"
                        />
                    </CardContent>
                </Card>

                {/* =================================================
                    RIWAYAT PEMINJAMAN
                ================================================== */}

                <Card className="mt-6">
                    <CardContent className="p-0">
                        <p className="p-4 text-sm font-semibold">Riwayat Peminjaman</p>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4">#</TableHead>

                                    <TableHead>Kode Pinjam</TableHead>

                                    <TableHead>Dipinjam Oleh</TableHead>

                                    <TableHead>Tanggal Pinjam</TableHead>

                                    <TableHead>Tanggal Kembali</TableHead>

                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loans.paged.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                                            Belum ada riwayat peminjaman
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    loans.paged.map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="px-4">
                                                {(loans.page - 1) * PER_PAGE + index + 1}
                                            </TableCell>

                                            <TableCell>{row.loan_code}</TableCell>

                                            <TableCell>{row.loan_by ?? '-'}</TableCell>

                                            <TableCell>{formatDateIndo(row.loan_date)}</TableCell>

                                            <TableCell>
                                                {row.return_date ? formatDateIndo(row.return_date) : '-'}
                                            </TableCell>

                                            <TableCell>{row.status}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            page={loans.page}
                            setPage={loans.setPage}
                            totalPages={loans.totalPages}
                            total={(tool.loan_history ?? []).length}
                            label="Riwayat Peminjaman"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* =====================================================
                IMAGE VIEWER MODAL
            ====================================================== */}

            <Dialog
                open={imageViewerOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeImageViewer();
                    }
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="max-h-[95vh] max-w-[95vw] border-0 bg-transparent p-0 shadow-none outline-none"
                >
                    <DialogTitle className="sr-only">Preview Foto {tool.name}</DialogTitle>

                    {selectedImageIndex !== null && images[selectedImageIndex] && (
                        <div className="relative flex h-[90vh] w-full items-center justify-center">
                            {/* =================================
                                    FOTO UTAMA MODAL
                                ================================== */}

                            <img
                                src={images[selectedImageIndex].url}
                                alt={`${tool.name} ${selectedImageIndex + 1}`}
                                className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
                            />

                            {/* =================================
                                    PANAH KIRI
                                ================================== */}

                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={showPreviousImage}
                                    className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:bg-black/80 sm:left-4"
                                    aria-label="Foto sebelumnya"
                                >
                                    <IconChevronLeft className="size-6" />
                                </button>
                            )}

                            {/* =================================
                                    PANAH KANAN
                                ================================== */}

                            {images.length > 1 && (
                                <button
                                    type="button"
                                    onClick={showNextImage}
                                    className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:bg-black/80 sm:right-4"
                                    aria-label="Foto berikutnya"
                                >
                                    <IconChevronRight className="size-6" />
                                </button>
                            )}

                            {/* =================================
                                    COUNTER
                                ================================== */}

                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                    {selectedImageIndex + 1} / {images.length}
                                </div>
                            )}

                            {/* =================================
                                    CLOSE
                                ================================== */}

                            <button
                                type="button"
                                onClick={closeImageViewer}
                                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/70 text-xl text-white shadow-lg transition hover:bg-black/90"
                                aria-label="Tutup preview"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* =====================================================
                EDIT TOOL MODAL
            ====================================================== */}

            <EditToolModal
                open={editOpen}
                onOpenChange={setEditOpen}
                tool={selectedTool}
                categories={categories}
                locations={locations}
                users={users}
                action="PUT"
                inventory_types={inventory_types}
                statuses={statuses}
            />
        </>
    );
}

/*
 * ============================================================
 * BADGE
 * ============================================================
 */

function Badge({ children }) {
    return (
        <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
            {children}
        </span>
    );
}

/*
 * ============================================================
 * INFO BOX
 * ============================================================
 */

function InfoBox({ label, value }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>

            <p className="mt-1 truncate font-semibold">{value}</p>
        </div>
    );
}

Show.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

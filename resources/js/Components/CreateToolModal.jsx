import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import ToolFormFields from '@/Components/ToolFormFields';
import { blobToFile, clearDraftImages, getDraftImages, saveDraftImages } from '@/lib/toolImageDb';
import { flashMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const TEXT_DRAFT_KEY = 'tool-draft-create';
const IMAGE_DRAFT_KEY = 'tool-draft-create';

function emptyData() {
    return {
        category_id: '',
        location_id: '',
        name: '',
        stock: 0,
        inventory_type: 'Internal',
        used_by: '',
        status: 'Tersedia',
        note: '',
        attributes: [],
    };
}

export default function CreateToolModal({
    open,
    onOpenChange,
    categories,
    locations,
    users,
    action,
    method,
    inventory_types,
    statuses,
    lockCategory = null,
    lockLocation = null,
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        ...emptyData(),
        _method: method,
    });

    const [images, setImages] = useState([]);

    // Modal konfirmasi Batal
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const objectUrlsRef = useRef([]);

    const handleCancelClick = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirmation = () => {
        setShowCancelConfirmation(false);
    };

    const handleConfirmCancel = () => {
        // Tutup modal konfirmasi
        setShowCancelConfirmation(false);

        // Hapus draft text
        localStorage.removeItem(TEXT_DRAFT_KEY);

        // Hapus draft gambar dari IndexedDB
        clearDraftImages(IMAGE_DRAFT_KEY);

        // Bersihkan semua Object URL
        objectUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
        });

        objectUrlsRef.current = [];

        // Kosongkan images
        setImages([]);

        // Reset form
        reset({
            ...emptyData(),
            _method: method,
        });

        // Bersihkan validation error
        clearErrors();

        // Tutup modal utama
        onOpenChange(false);
    };

    /*
     * ============================================================
     * RESTORE DRAFT
     * ============================================================
     */
    useEffect(() => {
        if (!open) return;

        const savedText = localStorage.getItem(TEXT_DRAFT_KEY);

        const restoredText = savedText ? JSON.parse(savedText) : emptyData();

        setData({
            ...restoredText,

            category_id: lockCategory ? String(lockCategory.id) : restoredText.category_id,

            location_id: lockLocation ? String(lockLocation.id) : restoredText.location_id,

            _method: method,
        });

        /*
         * Restore gambar dari IndexedDB
         */
        (async () => {
            const restoredImages = await getDraftImages(IMAGE_DRAFT_KEY);

            const withPreview = restoredImages.map((img) => {
                const url = URL.createObjectURL(img.blob);

                objectUrlsRef.current.push(url);

                return {
                    key: img.key,
                    source: 'new',
                    file: blobToFile(img.blob, img.name, img.type),
                    previewUrl: url,
                    isPrimary: img.isPrimary,
                };
            });

            setImages(withPreview);
        })();
    }, [open]);

    /*
     * ============================================================
     * CLEANUP OBJECT URL
     * ============================================================
     */
    useEffect(() => {
        return () => {
            objectUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            objectUrlsRef.current = [];
        };
    }, []);

    /*
     * ============================================================
     * AUTO SAVE TEXT
     * ============================================================
     */
    useEffect(() => {
        if (!open) return;

        const { _method, ...toSave } = data;

        localStorage.setItem(TEXT_DRAFT_KEY, JSON.stringify(toSave));
    }, [data, open]);

    /*
     * ============================================================
     * AUTO SAVE IMAGES
     * ============================================================
     */
    useEffect(() => {
        if (!open) return;

        const toSave = images.map((img) => ({
            key: img.key,
            name: img.file.name,
            type: img.file.type,
            blob: img.file,
            isPrimary: img.isPrimary,
        }));

        saveDraftImages(IMAGE_DRAFT_KEY, toSave);
    }, [images, open]);

    /*
     * ============================================================
     * ADD IMAGE
     * ============================================================
     */
    const handleAddImages = (files) => {
        const newItems = files.map((file) => ({
            key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            source: 'new',
            file,
            previewUrl: URL.createObjectURL(file),
            isPrimary: false,
        }));

        setImages((prev) => {
            const merged = [...prev, ...newItems];

            if (!merged.some((image) => image.isPrimary) && merged.length > 0) {
                merged[0].isPrimary = true;
            }

            return merged;
        });
    };

    /*
     * ============================================================
     * REMOVE IMAGE
     * ============================================================
     */
    const handleRemoveImage = (key) => {
        setImages((prev) => {
            const filtered = prev.filter((image) => image.key !== key);

            if (filtered.length > 0 && !filtered.some((image) => image.isPrimary)) {
                filtered[0].isPrimary = true;
            }

            return filtered;
        });
    };

    /*
     * ============================================================
     * SET PRIMARY IMAGE
     * ============================================================
     */
    const handleSetPrimaryImage = (key) => {
        setImages((prev) =>
            prev.map((image) => ({
                ...image,
                isPrimary: image.key === key,
            })),
        );
    };

    /*
     * ============================================================
     * SUBMIT
     * ============================================================
     */
    const submit = (e) => {
        e.preventDefault();

        setData(
            'images',
            images.map((img) => ({
                type: 'new',
                is_primary: img.isPrimary,
                file: img.file,
            })),
        );

        post(action, {
            forceFormData: true,

            onSuccess: (success) => {
                // Hapus draft text
                localStorage.removeItem(TEXT_DRAFT_KEY);

                // Hapus draft gambar
                clearDraftImages(IMAGE_DRAFT_KEY);

                // Bersihkan Object URL
                objectUrlsRef.current.forEach((url) => {
                    URL.revokeObjectURL(url);
                });

                objectUrlsRef.current = [];

                // Kosongkan images
                setImages([]);

                // Reset form
                reset({
                    ...emptyData(),
                    _method: method,
                });

                // Bersihkan errors
                clearErrors();

                // Tutup modal
                onOpenChange(false);

                // Flash message
                const flash = flashMessage(success);

                if (flash) {
                    toast[flash.type](flash.message);
                }
            },

            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            {/* =====================================================
                MODAL UTAMA
            ====================================================== */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <form onSubmit={submit}>
                        <DialogHeader>
                            <DialogTitle>Tambah Tool</DialogTitle>

                            <DialogDescription>
                                Isi informasi tool. Draft otomatis tersimpan di perangkat ini kalau halaman ter-reload
                                sebelum sempat disimpan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <ToolFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                categories={categories}
                                locations={locations}
                                users={users}
                                INVENTORY_TYPE_OPTIONS={inventory_types}
                                STATUS_OPTIONS={statuses}
                                lockCategory={lockCategory}
                                lockLocation={lockLocation}
                                images={images}
                                onAddImages={handleAddImages}
                                onRemoveImage={handleRemoveImage}
                                onSetPrimaryImage={handleSetPrimaryImage}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelClick}>
                                Batal
                            </Button>

                            <Button type="submit" variant="blue" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* =====================================================
                MODAL KONFIRMASI BATAL
            ====================================================== */}
            <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Batalkan pengisian?</DialogTitle>

                        <DialogDescription>
                            Semua inputan, foto, dan draft yang tersimpan akan dihapus dan dikembalikan ke kondisi awal.
                            Tindakan ini tidak dapat dibatalkan.
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
        </>
    );
}

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

export default function EditToolModal({
    open,
    onOpenChange,
    tool,
    categories,
    locations,
    users,
    method,
    inventory_types,
    statuses,
    lockCategory = null,
    lockLocation = null,
}) {
    const textDraftKey = tool ? `tool-draft-edit-${tool.id}` : null;
    const imageDraftKey = tool ? `tool-draft-edit-${tool.id}` : null;

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        ...emptyData(),
        _method: method,
    });

    const [images, setImages] = useState([]);

    // Modal konfirmasi Batal
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

    const objectUrlsRef = useRef([]);

    /*
     * ============================================================
     * CANCEL
     * ============================================================
     */

    const handleCancelClick = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirmation = () => {
        setShowCancelConfirmation(false);
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirmation(false);

        // Hapus draft text
        if (textDraftKey) {
            localStorage.removeItem(textDraftKey);
        }

        // Hapus draft gambar
        if (imageDraftKey) {
            clearDraftImages(imageDraftKey);
        }

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

        // Bersihkan validation errors
        clearErrors();

        // Tutup modal
        onOpenChange(false);
    };

    /*
     * ============================================================
     * RESTORE DATA / DRAFT
     * ============================================================
     */

    useEffect(() => {
        if (!open || !tool) return;

        const savedText = textDraftKey ? localStorage.getItem(textDraftKey) : null;

        const toolData = {
            category_id: String(tool.category?.id ?? ''),
            location_id: String(tool.location?.id ?? ''),
            name: tool.name ?? '',
            stock: tool.stock ?? 0,
            inventory_type: tool.inventory_type ?? 'Internal',
            used_by: tool.used_by ?? '',
            status: tool.status ?? 'Tersedia',
            note: tool.note ?? '',
            attributes: Object.entries(tool.attributes ?? {}).map(([fieldName, value]) => {
                const attr = categories
                    .flatMap((category) => category.attributes ?? [])
                    .find((attribute) => attribute.field_name === fieldName);

                return {
                    tool_attribute_id: attr?.id,
                    value,
                };
            }),
        };

        const restoredText = savedText ? JSON.parse(savedText) : toolData;

        setData({
            ...restoredText,
            _method: method,
        });

        /*
         * ========================================================
         * RESTORE EXISTING IMAGES
         * ========================================================
         */

        const existingImages = (tool.images ?? []).map((img) => ({
            key: `existing-${img.id}`,
            source: 'existing',
            existingId: img.id,
            previewUrl: img.url,
            isPrimary: img.is_primary,
        }));

        /*
         * ========================================================
         * RESTORE NEW IMAGES FROM INDEXED DB
         * ========================================================
         */

        (async () => {
            const restoredImages = imageDraftKey ? await getDraftImages(imageDraftKey) : [];

            const restoredNewImages = restoredImages.map((img) => {
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

            setImages([...existingImages, ...restoredNewImages]);
        })();
    }, [open, tool, categories, method, textDraftKey, imageDraftKey]);

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
        if (!open || !textDraftKey) return;

        const { _method, ...toSave } = data;

        localStorage.setItem(textDraftKey, JSON.stringify(toSave));
    }, [data, open, textDraftKey]);

    /*
     * ============================================================
     * AUTO SAVE IMAGES
     * ============================================================
     */

    useEffect(() => {
        if (!open || !imageDraftKey) return;

        // Hanya simpan gambar baru.
        // Existing images berasal dari server dan tidak perlu disimpan
        // ke IndexedDB.
        const newImages = images.filter((image) => image.source === 'new');

        const toSave = newImages.map((image) => ({
            key: image.key,
            name: image.file.name,
            type: image.file.type,
            blob: image.file,
            isPrimary: image.isPrimary,
        }));

        saveDraftImages(imageDraftKey, toSave);
    }, [images, open, imageDraftKey]);

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

        const formattedImages = images.map((image) => {
            if (image.source === 'existing') {
                return {
                    type: 'existing',
                    id: image.existingId,
                    is_primary: image.isPrimary,
                };
            }

            return {
                type: 'new',
                is_primary: image.isPrimary,
                file: image.file,
            };
        });

        transform((formData) => ({
            ...formData,
            _method: 'PUT',
            images: formattedImages,
        }));

        post(route('tools.update', tool.tool_code), {
            forceFormData: true,

            onSuccess: (success) => {
                if (textDraftKey) {
                    localStorage.removeItem(textDraftKey);
                }

                if (imageDraftKey) {
                    clearDraftImages(imageDraftKey);
                }

                objectUrlsRef.current.forEach((url) => {
                    URL.revokeObjectURL(url);
                });

                objectUrlsRef.current = [];

                setImages([]);

                reset({
                    ...emptyData(),
                    _method: 'PUT',
                });

                clearErrors();

                onOpenChange(false);

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
                            <DialogTitle>Edit Tool</DialogTitle>

                            <DialogDescription>
                                Ubah informasi tool. Draft otomatis tersimpan di perangkat ini kalau halaman ter-reload
                                sebelum sempat disimpan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            {tool && (
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
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelClick}>
                                Batal
                            </Button>

                            <Button type="submit" variant="blue" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                        <DialogTitle>Batalkan perubahan?</DialogTitle>

                        <DialogDescription>
                            Semua perubahan, foto baru, dan draft yang tersimpan akan dihapus. Data tool akan kembali
                            seperti sebelum diedit. Tindakan ini tidak dapat dibatalkan.
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

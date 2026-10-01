import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '@/Components/ui/dialog';
import { IconPlus, IconStar, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { compressImage } from '@/lib/compressImage';
import { toast } from 'sonner';

export default function ToolFormFields({
    data,
    setData,
    errors,
    categories,
    locations,
    STATUS_OPTIONS,
    users,
    lockCategory,
    INVENTORY_TYPE_OPTIONS,
    lockLocation,
    images,
    onAddImages,
    onRemoveImage,
    onSetPrimaryImage,
}) {
    const [selectedImage, setSelectedImage] = useState(null);

    const selectedCategory = categories.find((c) => String(c.id) === String(data.category_id));

    const selectedLocation = locations.find((location) => String(location.id) === String(data.location_id));

    const locationDisplay = lockLocation
        ? `${lockLocation.name}${lockLocation.parent?.name ? ` (${lockLocation.parent.name})` : ''}`
        : selectedLocation
          ? `${selectedLocation.name}${selectedLocation.parent?.name ? ` (${selectedLocation.parent.name})` : ''}`
          : '';

    const categoryAttributes = selectedCategory?.attributes ?? [];

    const getAttrValue = (attributeId) => data.attributes.find((a) => a.tool_attribute_id === attributeId)?.value ?? '';

    const setAttrValue = (attributeId, value) => {
        const others = data.attributes.filter((a) => a.tool_attribute_id !== attributeId);

        setData('attributes', [
            ...others,
            {
                tool_attribute_id: attributeId,
                value,
            },
        ]);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Informasi Dasar Tool */}
                <div>
                    <p className="mb-3 text-sm font-semibold">Informasi Dasar Tool</p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Kategori */}
                        <div className="grid gap-2">
                            <Label>Kategori Tool</Label>

                            <Select
                                value={data.category_id ? String(data.category_id) : ''}
                                onValueChange={(value) => setData('category_id', value)}
                                disabled={Boolean(lockCategory)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih kategori">{lockCategory?.name}</SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>

                        {/* Lokasi */}
                        <div className="grid gap-2">
                            <Label>Lokasi</Label>

                            <Select
                                value={data.location_id ? String(data.location_id) : ''}
                                onValueChange={(value) => setData('location_id', value)}
                                disabled={Boolean(lockLocation)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih lokasi">{locationDisplay}</SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={String(location.id)}>
                                            {location.name}

                                            {location.parent?.name && (
                                                <span className="font-bold"> ({location.parent.name})</span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.location_id && <p className="text-sm text-red-500">{errors.location_id}</p>}
                        </div>

                        {/* Nama Tool */}
                        <div className="grid gap-2">
                            <Label>Nama Tool</Label>

                            <Input
                                placeholder="Masukkan nama tool"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />

                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Stok */}
                        <div className="grid gap-2">
                            <Label>Stok</Label>

                            <Input
                                type="number"
                                min={0}
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                            />

                            {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                        </div>

                        {/* Tipe Inventory */}
                        <div className="grid gap-2">
                            <Label>Tipe Inventory</Label>

                            <Select
                                value={data.inventory_type}
                                onValueChange={(value) => setData('inventory_type', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>

                                <SelectContent>
                                    {INVENTORY_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.inventory_type && <p className="text-sm text-red-500">{errors.inventory_type}</p>}
                        </div>

                        {/* Digunakan Oleh */}
                        <div className="grid gap-2">
                            <Label>Digunakan Oleh</Label>

                            <Select
                                value={data.used_by ? String(data.used_by) : 'none'}
                                onValueChange={(value) => setData('used_by', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua Staff" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="none">Semua Staff</SelectItem>

                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.used_by && <p className="text-sm text-red-500">{errors.used_by}</p>}
                        </div>

                        {/* Status Tool */}
                        <div className="grid gap-2">
                            <Label>Status Tool</Label>

                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>

                                <SelectContent>
                                    {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.label} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                        </div>

                        {/* Catatan */}
                        <div className="grid gap-2">
                            <Label>Catatan</Label>

                            <Textarea
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="min-h-[38px]"
                            />

                            {errors.note && <p className="text-sm text-red-500">{errors.note}</p>}
                        </div>
                    </div>
                </div>

                {/* Atribut dinamis sesuai kategori */}
                {selectedCategory && categoryAttributes.length > 0 && (
                    <div>
                        <p className="mb-2 text-sm font-semibold">
                            Atribut kategori &quot;
                            {selectedCategory.name}
                            &quot;
                        </p>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {categoryAttributes.map((attribute) => (
                                    <div key={attribute.id} className="grid gap-2">
                                        <Label>{attribute.field_name}</Label>

                                        <Input
                                            className="bg-white"
                                            value={getAttrValue(attribute.id)}
                                            onChange={(e) => setAttrValue(attribute.id, e.target.value)}
                                        />

                                        {errors[`attributes.${attribute.id}`] && (
                                            <p className="text-sm text-red-500">
                                                {errors[`attributes.${attribute.id}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="mt-3 text-xs text-blue-600">
                                Field ini berganti otomatis kalau kategori di atas diubah
                            </p>
                        </div>
                    </div>
                )}

                {/* Foto Tool */}
                <div>
                    <p className="mb-2 text-lg font-semibold">Foto Tool</p>

                    <div className="rounded-lg border p-4">
                        <Label className="mb-2 block">Upload foto (bisa lebih dari satu)</Label>

                        <div className="flex flex-wrap gap-3">
                            {images.map((image) => (
                                <div key={image.key} className="w-24 text-center">
                                    <div className="relative">
                                        {/* Thumbnail */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(image)}
                                            className="block cursor-zoom-in rounded-lg"
                                            title="Klik untuk melihat foto"
                                        >
                                            <img
                                                src={image.previewUrl}
                                                alt="Preview foto tool"
                                                className={`h-24 w-24 rounded-lg border-2 object-cover transition hover:scale-[1.02] hover:opacity-80 ${
                                                    image.isPrimary ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                            />
                                        </button>

                                        {/* Tombol hapus */}
                                        <button
                                            type="button"
                                            onClick={() => onRemoveImage(image.key)}
                                            className="absolute -right-2 -top-2 z-10 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                                            title="Hapus foto"
                                        >
                                            <IconTrash className="size-3" />
                                        </button>

                                        {/* Label utama */}
                                        {image.isPrimary && (
                                            <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-blue-500 px-1 text-[10px] text-white">
                                                <IconStar className="size-2.5" />
                                                Utama
                                            </span>
                                        )}
                                    </div>

                                    {/* Jadikan utama */}
                                    {!image.isPrimary ? (
                                        <button
                                            type="button"
                                            onClick={() => onSetPrimaryImage(image.key)}
                                            className="mt-1 text-[11px] text-blue-600 hover:underline"
                                        >
                                            Jadikan foto utama
                                        </button>
                                    ) : null}
                                </div>
                            ))}

                            {/* Upload */}
                            <label className="flex size-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:bg-muted/40">
                                <IconPlus className="size-6" />

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files ?? []);

                                        // Reset input supaya file yang sama
                                        // bisa dipilih lagi
                                        e.target.value = '';

                                        if (files.length === 0) {
                                            return;
                                        }

                                        // =====================================================
                                        // VALIDASI FILE
                                        // Hanya image yang diperbolehkan
                                        // =====================================================

                                        const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));

                                        if (invalidFiles.length > 0) {
                                            toast.error('File tidak valid. Hanya file gambar yang diperbolehkan.');

                                            return;
                                        }

                                        // =====================================================
                                        // COMPRESS IMAGE
                                        // =====================================================

                                        try {
                                            const compressedFiles = await Promise.all(
                                                files.map((file) =>
                                                    compressImage(file, {
                                                        maxWidth: 1600,
                                                        maxHeight: 1600,
                                                        quality: 0.8,
                                                        type: 'image/jpeg',
                                                    }),
                                                ),
                                            );

                                            onAddImages(compressedFiles);
                                        } catch (error) {
                                            console.error('Gagal compress gambar:', error);

                                            toast.error('Gagal memproses gambar. Silakan coba lagi.');
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                            Foto ini akan tersimpan setelah tool berhasil disimpan
                        </p>
                    </div>
                </div>
            </div>

            {/* =====================================================
    MODAL PREVIEW FOTO
===================================================== */}
            <Dialog
                open={Boolean(selectedImage)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedImage(null);
                    }
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="max-h-[95vh] max-w-[95vw] border-0 bg-transparent p-0 shadow-none outline-none"
                >
                    <DialogTitle className="sr-only">Preview Foto Tool</DialogTitle>

                    {selectedImage && (
                        <div className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center">
                            {/* Gambar */}
                            <img
                                src={selectedImage.previewUrl}
                                alt="Foto tool"
                                className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
                            />

                            {/* Tombol X */}
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-black/90"
                                aria-label="Tutup preview"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-5"
                                >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

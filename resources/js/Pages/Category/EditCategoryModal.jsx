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
import { Switch } from '@/Components/ui/switch';
import { flashMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

function emptyAttribute() {
    return {
        id: null,
        field_name: '',
    };
}

export default function EditCategoryModal({ open, onOpenChange, category, method }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        attributes: [],
        _method: method,
    });

    useEffect(() => {
        if (open && category) {
            setData({
                name: category.name ?? '',
                attributes: (category.attributes ?? []).map((att) => ({
                    id: att.id,
                    field_name: att.field_name,
                })),
                _method: method,
            });
        }

        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, category]);

    const addAttributes = () => {
        setData('attributes', [...data.attributes, emptyAttribute()]);
    };

    const removeAttributes = (index) => {
        setData(
            'attributes',
            data.attributes.filter((_, i) => i !== index),
        );
    };

    const updateAttributes = (index, field, value) => {
        setData(
            'attributes',
            data.attributes.map((sub, i) =>
                i === index
                    ? {
                          ...sub,
                          [field]: value,
                      }
                    : sub,
            ),
        );
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('category.update', [category.slug]), {
            onSuccess: (success) => {
                reset();
                onOpenChange(false);

                const flash = flashMessage(success);
                if (flash) toast[flash.type](flash.message);
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Edit Kategori</DialogTitle>

                        <DialogDescription>
                            Isi nama kategori. Jika kategori ini memiliki sub kategori (misal ssd,charger), tambahkan di
                            bawah.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="scroll-bar max-h-[60vh] space-y-5 overflow-y-auto py-4 pr-1">
                        {/* Nama kategori */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Nama kategori <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="name"
                                placeholder="Contoh: SN, Voltase"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />

                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Attribute */}
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Attribute <span className="text-muted-foreground">(opsional)</span>
                                </Label>
                            </div>

                            {data.attributes.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Belum ada Attribute untuk kategori ini. Klik "Tambah Attribute" sebagai informasi
                                    tambahan untuk kategori ini, misal (SN, Voltase)
                                </p>
                            )}

                            {data.attributes.map((sub, index) => (
                                <div key={index} className="space-y-3 rounded-lg border p-3">
                                    {/* Nama + Delete */}
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor={`attribute-${index}`}>Attribute {index + 1}</Label>
                                            <Input
                                                id={`attribute-${index}`}
                                                value={sub.field_name}
                                                onChange={(e) => updateAttributes(index, 'field_name', e.target.value)}
                                            />

                                            {errors[`attributes.${index}.field_name`] && (
                                                <p className="text-sm text-red-500">
                                                    {errors[`attributes.${index}.field_name`]}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => removeAttributes(index)}
                                        >
                                            <IconTrash className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Tambah Sub kategori */}
                            <Button type="button" variant="outline" size="sm" onClick={addAttributes}>
                                <IconPlus className="size-4" />
                                Tambah Attribute
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>

                        <Button type="submit" variant="blue" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

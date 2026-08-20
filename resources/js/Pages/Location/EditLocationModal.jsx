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

function emptySubLocation() {
    return {
        id: null,
        name: '',
        has_owner: false,
        user_id: '',
    };
}

export default function EditLocationModal({ open, onOpenChange, location, users, action, method }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        sub_locations: [],
        _method: method,
    });

    // pre-fill form tiap modal dibuka dengan data lokasi yang mau diedit
    useEffect(() => {
        if (open && location) {
            setData({
                name: location.name ?? '',
                sub_locations: (location.children ?? []).map((child) => ({
                    id: child.id,
                    name: child.name,
                    has_owner: Boolean(child.user_id),
                    user_id: child.user_id ? String(child.user_id) : '',
                })),
                _method: method,
            });
        }

        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, location]);

    const addSubLocation = () => {
        setData('sub_locations', [...data.sub_locations, emptySubLocation()]);
    };

    const removeSubLocation = (index) => {
        setData(
            'sub_locations',
            data.sub_locations.filter((_, i) => i !== index),
        );
    };

    const updateSubLocation = (index, field, value) => {
        setData(
            'sub_locations',
            data.sub_locations.map((sub, i) =>
                i === index
                    ? {
                          ...sub,
                          [field]: value,
                      }
                    : sub,
            ),
        );
    };

    const toggleSubLocationOwner = (index, checked) => {
        setData(
            'sub_locations',
            data.sub_locations.map((sub, i) =>
                i === index
                    ? {
                          ...sub,
                          has_owner: checked,
                          user_id: checked ? sub.user_id : '',
                      }
                    : sub,
            ),
        );
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('location.update', location.slug), {
            onSuccess: (success) => {
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
                        <DialogTitle>Edit Lokasi</DialogTitle>

                        <DialogDescription>
                            Ubah nama lokasi atau kelola sub lokasinya. Sub lokasi yang dihapus dari daftar di bawah
                            akan ikut dihapus saat disimpan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="scroll-bar max-h-[60vh] space-y-5 overflow-y-auto py-4 pr-1">
                        {/* Nama Lokasi */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Nama Lokasi <span className="text-red-500">*</span>
                            </Label>

                            <Input
                                id="name"
                                placeholder="Contoh: Kembar, Maranatha"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />

                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Sub Lokasi */}
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <Label>
                                    Sub Lokasi <span className="text-muted-foreground">(opsional)</span>
                                </Label>
                            </div>

                            {data.sub_locations.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Belum ada sub lokasi. Klik "Tambah Sub Lokasi" kalau lokasi ini punya bagian sub
                                    lokasi (misal meja per orang).
                                </p>
                            )}

                            {data.sub_locations.map((sub, index) => (
                                <div key={sub.id ?? `new-${index}`} className="space-y-3 rounded-lg border p-3">
                                    {/* Nama + Delete */}
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Input
                                                placeholder={`Contoh: Meja ${index + 1}`}
                                                value={sub.name}
                                                onChange={(e) => updateSubLocation(index, 'name', e.target.value)}
                                            />

                                            {errors[`sub_locations.${index}.name`] && (
                                                <p className="text-sm text-red-500">
                                                    {errors[`sub_locations.${index}.name`]}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => removeSubLocation(index)}
                                        >
                                            <IconTrash className="size-4" />
                                        </Button>
                                    </div>

                                    {/* Has Owner */}
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={`has-owner-${index}`} className="text-sm font-normal">
                                            Ada pemilik sub lokasi ini?
                                        </Label>

                                        <Switch
                                            id={`has-owner-${index}`}
                                            checked={Boolean(sub.has_owner)}
                                            onCheckedChange={(checked) => toggleSubLocationOwner(index, checked)}
                                        />
                                    </div>

                                    {/* Owner */}
                                    {sub.has_owner && (
                                        <div className="grid gap-1">
                                            <Select
                                                value={sub.user_id ? String(sub.user_id) : undefined}
                                                onValueChange={(value) => updateSubLocation(index, 'user_id', value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih pemilik" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={String(user.id)}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {errors[`sub_locations.${index}.user_id`] && (
                                                <p className="text-sm text-red-500">
                                                    {errors[`sub_locations.${index}.user_id`]}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Tambah Sub Lokasi */}
                            <Button type="button" variant="outline" size="sm" onClick={addSubLocation}>
                                <IconPlus className="size-4" />
                                Tambah Sub Lokasi
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>

                        <Button type="submit" variant="blue" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Modal tambah/edit SATU sub lokasi (beda dari CreateLocationModal yang bisa
 * nambah banyak sub lokasi sekaligus pas bikin lokasi baru).
 *
 * `subLocation` = null -> mode tambah. Diisi object -> mode edit (form di-prefill).
 * `action` & `method` dikirim dari Show.jsx, nunjuk ke route sub-lokasi yang sesuai.
 */
export default function SubLocationModal({ open, onOpenChange, subLocation, users, action, method }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        has_owner: false,
        user_id: '',
        _method: method,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: subLocation?.name ?? '',
                has_owner: Boolean(subLocation?.user_id),
                user_id: subLocation?.user_id ? String(subLocation.user_id) : '',
                _method: method,
            });
        }
        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, subLocation]);

    const submit = (e) => {
        e.preventDefault();

        post(action, {
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
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{subLocation ? 'Edit Sub Lokasi' : 'Tambah Sub Lokasi'}</DialogTitle>
                        <DialogDescription>
                            {subLocation
                                ? 'Ubah nama atau kepemilikan sub lokasi ini.'
                                : 'Tambahkan sub lokasi baru di bawah lokasi ini.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sub-name">
                                Nama Sub Lokasi <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="sub-name"
                                placeholder="Contoh: Meja A"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoFocus
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="sub-has-owner" className="text-sm font-normal">
                                Ada pemilik sub lokasi ini?
                            </Label>
                            <Switch
                                id="sub-has-owner"
                                checked={data.has_owner}
                                onCheckedChange={(checked) =>
                                    setData((prev) => ({
                                        ...prev,
                                        has_owner: checked,
                                        user_id: checked ? prev.user_id : '',
                                    }))
                                }
                            />
                        </div>

                        {data.has_owner && (
                            <div className="grid gap-1">
                                <Select
                                    value={data.user_id ? String(data.user_id) : undefined}
                                    onValueChange={(value) => setData('user_id', value)}
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
                                {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                            </div>
                        )}
                    </div>

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

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
import { flashMessage } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AttributeModal({ open, onOpenChange, attribute, category, action, method }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        field_name: '',
        category_id: '',
        _method: method,
    });

    useEffect(() => {
        if (open) {
            setData({
                field_name: attribute?.field_name ?? '',
                category_id: category.id,
                _method: method,
            });
        }
        if (!open) {
            reset();
            clearErrors();
        }
    }, [open, attribute]);

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
                        <DialogTitle>{attribute ? 'Edit Attribute' : 'Tambah Attribute'}</DialogTitle>
                        <DialogDescription>
                            {attribute ? 'Ubah nama Attribute ini.' : 'Tambahkan Attribute baru di bawah lokasi ini.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sub-name">
                                Nama Attribute <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="sub-name"
                                placeholder="Contoh: SN, Voltase"
                                value={data.field_name}
                                onChange={(e) => setData('field_name', e.target.value)}
                                autoFocus
                            />
                            {errors.field_name && <p className="text-sm text-red-500">{errors.field_name}</p>}
                        </div>
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

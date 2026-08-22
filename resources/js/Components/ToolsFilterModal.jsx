import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { IconFilter, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function ToolsFilterModal({
    params,
    onApply,
    onClear,
    categories = [],
    locations = [],
    users = [],
    statuses = [],
    inventory_types = [],
}) {
    const [open, setOpen] = useState(false);

    const [filters, setFilters] = useState({
        category: '',
        location: '',
        status: '',
        inventory_type: '',
        used_by: '',
    });

    /*
     * ============================================================
     * SYNC FILTER DENGAN PARAMS
     * ============================================================
     */
    useEffect(() => {
        if (open) {
            setFilters({
                category: params?.category ?? '',
                location: params?.location ?? '',
                status: params?.status ?? '',
                inventory_type: params?.inventory_type ?? '',
                used_by: params?.used_by ? String(params.used_by) : '',
            });
        }
    }, [open, params]);

    /*
     * ============================================================
     * SET FILTER
     * ============================================================
     */
    const setFilter = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /*
     * ============================================================
     * APPLY FILTER
     * ============================================================
     */
    const submit = (e) => {
        e.preventDefault();

        const newParams = {
            ...params,
            ...filters,
            page: 1,
        };

        onApply(newParams);
        setOpen(false);
    };

    /*
     * ============================================================
     * CLEAR FILTER
     * ============================================================
     */
    const clearFilters = () => {
        const newParams = {
            ...params,
            category: '',
            location: '',
            status: '',
            inventory_type: '',
            used_by: '',
            page: 1,
        };

        setFilters({
            category: '',
            location: '',
            status: '',
            inventory_type: '',
            used_by: '',
        });

        onClear(newParams);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* ====================================================
                FILTER BUTTON
            ==================================================== */}
            <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                    <IconFilter className="size-4" />
                    Filter
                </Button>
            </DialogTrigger>

            {/* ====================================================
                MODAL
            ==================================================== */}
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Filter Tools</DialogTitle>

                        <DialogDescription>
                            Gunakan filter untuk menampilkan tools berdasarkan kategori, lokasi, status, dan informasi
                            lainnya.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        {/* ====================================================
                            CATEGORY
                        ==================================================== */}
                        <div className="grid gap-2">
                            <Label>Kategori</Label>

                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(value) => setFilter('category', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua kategori</SelectItem>

                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.slug}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* LOCATION */}
                        <div className="grid gap-2">
                            <Label>Lokasi</Label>

                            <Select
                                value={filters.location || 'all'}
                                onValueChange={(value) => setFilter('location', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih lokasi" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua lokasi</SelectItem>

                                    {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.slug}>
                                            {location.name}
                                            {location.parent && ` (${location.parent.name})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ====================================================
                            STATUS
                        ==================================================== */}
                        <div className="grid gap-2">
                            <Label>Status</Label>

                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => setFilter('status', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua status</SelectItem>

                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ====================================================
                            INVENTORY TYPE
                        ==================================================== */}
                        <div className="grid gap-2">
                            <Label>Inventory Type</Label>

                            <Select
                                value={filters.inventory_type || 'all'}
                                onValueChange={(value) => setFilter('inventory_type', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih inventory type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua inventory type</SelectItem>

                                    {inventory_types.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ====================================================
                            USED BY
                        ==================================================== */}
                        <div className="grid gap-2">
                            <Label>Digunakan Oleh</Label>

                            <Select
                                value={filters.used_by || 'all'}
                                onValueChange={(value) => setFilter('used_by', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih pengguna" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua pengguna</SelectItem>

                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ====================================================
                        FOOTER
                    ==================================================== */}
                    <DialogFooter className="gap-2 sm:justify-between">
                        <Button type="button" variant="ghost" onClick={clearFilters}>
                            <IconRefresh className="size-4" />
                            Bersihkan Filter
                        </Button>

                        <Button type="submit" variant="blue">
                            <IconFilter className="size-4" />
                            Terapkan Filter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

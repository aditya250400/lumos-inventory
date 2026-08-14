import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import LocationCard from '@/Components/LocationCard';
import PaginationTable from '@/Components/PaginationTable';
import ShowFilter from '@/Components/ShowFilter';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    IconArrowsDownUp,
    IconDoor,
    IconLayoutGrid,
    IconLocation,
    IconLocationSearch,
    IconPencil,
    IconPlus,
    IconRefresh,
    IconTable,
    IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import CreateLocationModal from './CreateLocationModal';

const VIEW_STORAGE_KEY = 'location-index-view';

function getInitialView() {
    if (typeof window === 'undefined') return 'card';
    return localStorage.getItem(VIEW_STORAGE_KEY) || 'card';
}

export default function Index(props) {
    const { data: locations, meta, links } = props.locations;
    const [params, setParams] = useState(props.state);
    const [view, setView] = useState(getInitialView);
    const [createOpen, setCreateOpen] = useState(false);

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    UseFilter({
        route: route('location.index'),
        values: params,
        only: ['locations'],
    });

    useEffect(() => {
        localStorage.setItem(VIEW_STORAGE_KEY, view);
    }, [view]);

    // Index cuma nampilin lokasi top-level (parent_id null), jadi list ini
    // langsung dipakai sebagai opsi "Sub Lokasi Dari" di modal create.
    const parentOptions = useMemo(() => locations.map((l) => ({ id: l.id, name: l.name })), [locations]);

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={props.page_settings.title}
                        subtitle={props.page_settings.subtitle}
                        icon={IconLocation}
                    />
                    {hasAnyPermissions(props.auth.permissions, ['location.create']) && (
                        <Button
                            variant="blue"
                            size="xl"
                            className="w-full lg:w-auto"
                            onClick={() => setCreateOpen(true)}
                        >
                            <IconPlus className="size-4" /> Tambah
                        </Button>
                    )}
                </div>
                <Card>
                    <CardHeader className="mb-4 p-0">
                        {/* Filters */}
                        <div className="flex w-full flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center">
                            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center">
                                <Input
                                    className="w-full lg:w-1/4"
                                    placeholder="search"
                                    value={params?.search}
                                    onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))}
                                />
                                <Select value={params?.load} onValueChange={(e) => setParams({ ...params, load: e })}>
                                    <SelectTrigger className="w-full lg:w-24">
                                        <SelectValue placeholder="Load" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 23, 50, 75, 100].map((number, index) => (
                                            <SelectItem key={index} value={number}>
                                                {number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="red" onClick={() => setParams(props.state)} size="xl">
                                    <IconRefresh className="size-4" />
                                    Bersihkan
                                </Button>
                            </div>

                            {/* Switch tampilan Card / Tabel */}
                            <div className="flex shrink-0 rounded-lg border p-0.5">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={view === 'card' ? 'blue' : 'ghost'}
                                    className="gap-1.5"
                                    onClick={() => setView('card')}
                                >
                                    <IconLayoutGrid className="size-4" />
                                    Card
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={view === 'table' ? 'blue' : 'ghost'}
                                    className="gap-1.5"
                                    onClick={() => setView('table')}
                                >
                                    <IconTable className="size-4" />
                                    Tabel
                                </Button>
                            </div>
                        </div>
                        {/* show filter */}
                        <ShowFilter params={params} />
                    </CardHeader>

                    <CardContent className="[&-td]: p-0 [&-td]:whitespace-nowrap [&-th]:px-6">
                        {locations.length === 0 ? (
                            <EmptyState
                                icon={IconDoor}
                                title="Tidak ada lokasi"
                                subtitle="Mulailah dengan membuat lokasi baru"
                            />
                        ) : view === 'card' ? (
                            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {locations.map((location) => (
                                    <LocationCard key={location.id} location={location} auth={props.auth} />
                                ))}

                                {hasAnyPermissions(props.auth.permissions, ['location.create']) && (
                                    <button
                                        type="button"
                                        className="mb-2 text-left"
                                        onClick={() => setCreateOpen(true)}
                                    >
                                        <Card className="flex h-full min-h-[150px] items-center justify-center border-dashed text-muted-foreground hover:bg-muted/40">
                                            <p className="text-sm">+ Lokasi Baru</p>
                                        </Card>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="group inline-flex"
                                                onClick={() => onSortable('id')}
                                            >
                                                #
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="group inline-flex"
                                                onClick={() => onSortable('name')}
                                            >
                                                Lokasi
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="group inline-flex">
                                                Total Subs Lokasi
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="group inline-flex">
                                                Total Tool
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="group inline-flex">
                                                Total Stok
                                            </Button>
                                        </TableHead>

                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="group inline-flex"
                                                onClick={() => onSortable('created_at')}
                                            >
                                                Dibuat Pada
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        {hasAnyPermissions(props.auth.permissions, [
                                            'location.update',
                                            'location.delete',
                                        ]) && <TableHead>Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-center">
                                    {locations.map((location, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1 + (meta.current_page - 1) * meta.per_page}</TableCell>
                                            <TableCell>{location.name}</TableCell>
                                            <TableCell>{location.children_count}</TableCell>
                                            <TableCell>{location.tools_count}</TableCell>
                                            <TableCell>{location.total_stock}</TableCell>

                                            <TableCell>{formatDateIndo(location.created_at)}</TableCell>

                                            {hasAnyPermissions(props.auth.permissions, [
                                                'location',
                                                'location.update',
                                                'location.delete',
                                            ]) && (
                                                <TableCell>
                                                    <div className="flex items-center gap-x-1">
                                                        <Button variant="purple" size="sm" asChild>
                                                            <Link href={route('location.show', [location.slug])}>
                                                                <IconLocationSearch size="4" />
                                                                Lihat Lokasi
                                                            </Link>
                                                        </Button>
                                                        {hasAnyPermissions(props.auth.permissions, [
                                                            'location.update',
                                                        ]) && (
                                                            <Button variant="blue" size="sm" asChild>
                                                                <Link href={route('location.edit', [location])}>
                                                                    <IconPencil size="4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {hasAnyPermissions(props.auth.permissions, [
                                                            'location.delete',
                                                        ]) && (
                                                            <AlertAction
                                                                trigger={
                                                                    <Button variant="red" size="sm">
                                                                        <IconTrash className="size-4" />
                                                                        Delete
                                                                    </Button>
                                                                }
                                                                action={() =>
                                                                    deleteAction(route('location.destroy', [location]))
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-blue-600">{meta.to ?? 0}</span> dari{' '}
                            {meta.total} Lokasi
                        </p>
                        <div className="overflow-x-auto">
                            {meta.has_pages && <PaginationTable meta={meta} links={links} />}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <CreateLocationModal
                users={props.users}
                action={props.page_settings.action}
                method={props.page_settings.method}
                open={createOpen}
                onOpenChange={setCreateOpen}
                parentOptions={parentOptions}
            />
        </>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

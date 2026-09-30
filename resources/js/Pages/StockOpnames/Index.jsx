import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ShowFilter from '@/Components/ShowFilter';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconArrowsDownUp, IconPencilCheck, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export default function Index(props) {
    const { data: stockOpnames, meta, links } = props.stockOpnames;
    const [params, setParams] = useState(props.state);

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    UseFilter({
        route: route('stock-opnames.index'),
        values: params,
        only: ['stockOpnames'],
    });

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={props.page_setting.title}
                        subtitle={props.page_setting.subtitle}
                        icon={IconPencilCheck}
                    />
                    {hasAnyPermissions(props.auth.permissions, ['stock-opnames.create']) && (
                        <Button asChild variant="blue" size="xl" className="w-full lg:w-auto">
                            <Link href={route('stock-opnames.create')}>
                                <IconPlus className="size-4" /> Tambah
                            </Link>
                        </Button>
                    )}
                </div>
                <Card>
                    <CardHeader className="mb-4 p-0">
                        {/* Filters */}

                        <div className="flex w-full flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center">
                            {/* LOCATION */}
                            <Select
                                value={params.location || 'all'}
                                onValueChange={(value) =>
                                    setParams({ ...params, location: value === 'all' ? '' : value })
                                }
                            >
                                <SelectTrigger className="xl:w-fit">
                                    <SelectValue placeholder="Pilih lokasi" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Semua lokasi</SelectItem>

                                    {props.locations.map((location) => (
                                        <SelectItem key={location.id} value={location.slug}>
                                            {location.name}
                                            {location.parent && ` (${location.parent.name})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Created by */}

                            <Select
                                value={params.created_by || 'all'}
                                onValueChange={(value) =>
                                    setParams({ ...params, created_by: value === 'all' ? '' : value })
                                }
                            >
                                <SelectTrigger className="xl:w-fit">
                                    <SelectValue placeholder="Pilih pengguna" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Dibuat oleh semua</SelectItem>

                                    {props.users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* date filter */}
                            <div className="flex items-center gap-2">
                                <div className="w-full xl:flex xl:w-fit xl:items-center xl:gap-x-1">
                                    <Label htmlFor="date_from">Dari</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={params.date_from || ''}
                                        onChange={(e) =>
                                            setParams({
                                                ...params,
                                                date_from: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="w-full xl:flex xl:w-fit xl:items-center xl:gap-x-1">
                                    <Label htmlFor="date_to">Sampai</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={params.date_to || ''}
                                        onChange={(e) =>
                                            setParams({
                                                ...params,
                                                date_to: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Paginate */}
                            <Select value={params?.load} onValueChange={(e) => setParams({ ...params, load: e })}>
                                <SelectTrigger className="w-full xl:w-24">
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

                            {/* Reset */}
                            <Button variant="red" onClick={() => setParams(props.state)} size="sm">
                                <IconRefresh className="size-4" />
                                Bersihkan
                            </Button>
                        </div>
                        {/* show filter */}
                        <ShowFilter params={params} />
                    </CardHeader>

                    <CardContent className="[&-td]: p-0 [&-td]:whitespace-nowrap [&-th]:px-6">
                        {stockOpnames.length === 0 ? (
                            <EmptyState
                                icon={IconPencilCheck}
                                title="Tidak ada Stock Opnames"
                                subtitle="Mulailah dengan membuat Stock Opnames baru"
                            />
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
                                                onClick={() => onSortable('opname_date')}
                                            >
                                                Tanggal SO
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="group inline-flex"
                                                onClick={() => onSortable('location_id')}
                                            >
                                                Lokasi
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="group inline-flex"
                                                onClick={() => onSortable('created_by')}
                                            >
                                                Dibuat Oleh
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                onClick={() => onSortable('difference_count')}

                                                variant="ghost"
                                                className="group inline-flex"
                                            >
                                                Selisih
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-center">
                                    {stockOpnames.map((so, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1 + (meta.current_page - 1) * meta.per_page}</TableCell>
                                            <TableCell>{formatDateIndo(so.opname_date)}</TableCell>
                                            <TableCell>
                                                {so.location
                                                    ? so.location.parent?.name
                                                        ? `${so.location.name} (${so.location.parent.name})`
                                                        : so.location.name
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{so.createdBy.name}</TableCell>
                                            <TableCell>
                                                {so.difference_count > 0 ? (
                                                    <p className="font-bold text-red-500">
                                                        {`${so.difference_count} tool`}
                                                    </p>
                                                ) : (
                                                    'Tidak ada selisih'
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-x-1">
                                                    {hasAnyPermissions(props.auth.permissions, [
                                                        'stock-opnames.delete',
                                                    ]) && (
                                                        <AlertAction
                                                            trigger={
                                                                <Button variant="red" size="sm">
                                                                    <IconTrash className="size-4" />
                                                                    Delete
                                                                </Button>
                                                            }
                                                            action={() =>
                                                                deleteAction(route('stock-opnames.destroy', [role]))
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-blue-600">{meta.to ?? 0}</span> dari{' '}
                            {meta.total} Stock Opnames
                        </p>
                        <div className="overflow-x-auto">
                            {meta.has_pages && <PaginationTable meta={meta} links={links} />}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_setting.title} />;

import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ShowFilter from '@/Components/ShowFilter';
import StockOpnameModal from '@/Components/StockOpnameModal';
import ToolStatusBadge from '@/Components/ToolStatusBadge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
    IconArrowsDownUp,
    IconCancel,
    IconEye,
    IconPencil,
    IconPencilCheck,
    IconPlus,
    IconRefresh,
} from '@tabler/icons-react';
import StockOpnameDetailModal from '@/Components/StockOpnameDetailModal';

export default function Index(props) {
    const { data: stockOpnames, meta, links } = props.stockOpnames;

    const [params, setParams] = useState(props.state);

    const [stepOpname, setStepOpname] = useState(1);

    // Stock opname untuk wizard create / draft
    const [stockOpname, setStockOpname] = useState(null);
    const [rows, setRows] = useState([]);

    const [wizardOpen, setWizardOpen] = useState(false);

    // Stock opname yang sedang dilihat detail
    const [selectedStockOpname, setSelectedStockOpname] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

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

    useEffect(() => {
        if (!wizardOpen) {
            return;
        }

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [wizardOpen]);

    const handleDetail = (stockOpname) => {
        setSelectedStockOpname(stockOpname);
        setDetailModalOpen(true);
    };

    const handleDetailModalChange = (open) => {
        setDetailModalOpen(open);

        if (!open) {
            setSelectedStockOpname(null);
        }
    };

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
                        <Button
                            variant="blue"
                            size="xl"
                            className="w-full lg:w-auto"
                            onClick={() => setWizardOpen(true)}
                        >
                            <IconPlus className="size-4" />
                            Tambah
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader className="mb-4 p-0">
                        <div className="flex w-full flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center">
                            {/* LOCATION */}
                            <Select
                                value={params.location || 'all'}
                                onValueChange={(value) =>
                                    setParams({
                                        ...params,
                                        location: value === 'all' ? '' : value,
                                    })
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

                            {/* CREATED BY */}
                            <Select
                                value={params.created_by || 'all'}
                                onValueChange={(value) =>
                                    setParams({
                                        ...params,
                                        created_by: value === 'all' ? '' : value,
                                    })
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

                            {/* DATE */}
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

                            {/* PAGINATE */}
                            <Select
                                value={String(params?.load)}
                                onValueChange={(value) =>
                                    setParams({
                                        ...params,
                                        load: value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full xl:w-24">
                                    <SelectValue placeholder="Load" />
                                </SelectTrigger>

                                <SelectContent>
                                    {[10, 23, 50, 75, 100].map((number) => (
                                        <SelectItem key={number} value={String(number)}>
                                            {number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* RESET */}
                            <Button variant="red" onClick={() => setParams(props.state)} size="sm">
                                <IconRefresh className="size-4" />
                                Bersihkan
                            </Button>
                        </div>

                        <ShowFilter params={params} />
                    </CardHeader>

                    <CardContent className="p-0 [&-td]:whitespace-nowrap [&-th]:px-6">
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
                                                onClick={() => onSortable('created_at')}
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
                                                onClick={() => onSortable('status')}
                                            >
                                                Status
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

                                        <TableHead>Catatan</TableHead>

                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="text-center">
                                    {stockOpnames.map((so, index) => (
                                        <TableRow key={so.id}>
                                            <TableCell>{index + 1 + (meta.current_page - 1) * meta.per_page}</TableCell>

                                            <TableCell>{formatDateIndo(so.created_at)}</TableCell>

                                            <TableCell>
                                                <ToolStatusBadge status={so.status} />
                                            </TableCell>

                                            <TableCell>
                                                {so.location
                                                    ? so.location.parent?.name
                                                        ? `${so.location.name} (${so.location.parent.name})`
                                                        : so.location.name
                                                    : '-'}
                                            </TableCell>

                                            <TableCell>{so.createdBy?.name ?? '-'}</TableCell>

                                            <TableCell>
                                                {so.difference_count > 0 ? (
                                                    <p className="font-bold text-red-500">{so.difference_count} tool</p>
                                                ) : (
                                                    'Tidak ada selisih'
                                                )}
                                            </TableCell>

                                            <TableCell>{so.note ?? '-'}</TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-x-1">
                                                    {so.status === 'Draft' ? (
                                                        so.createdBy?.id === props.auth.user.id ? (
                                                            <>
                                                                <Button
                                                                    onClick={() => {
                                                                        setRows(so.details);
                                                                        setStockOpname(so);
                                                                        setStepOpname(2);
                                                                        setWizardOpen(true);
                                                                    }}
                                                                    variant="blue"
                                                                    size="sm"
                                                                >
                                                                    <IconPencil className="size-4" />
                                                                    Lanjutkan
                                                                </Button>

                                                                <AlertAction
                                                                    trigger={
                                                                        <Button variant="red" size="sm">
                                                                            <IconCancel className="size-4" />
                                                                            Batalkan
                                                                        </Button>
                                                                    }
                                                                    action={() =>
                                                                        deleteAction(
                                                                            route('stock-opnames.destroy', [so]),
                                                                        )
                                                                    }
                                                                />
                                                            </>
                                                        ) : (
                                                            '-'
                                                        )
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleDetail(so)}
                                                            variant="slate"
                                                            size="sm"
                                                        >
                                                            <IconEye className="size-4" />
                                                            Detail
                                                        </Button>
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

            {/* MODAL DETAIL */}
            <StockOpnameDetailModal
                open={detailModalOpen}
                onOpenChange={handleDetailModalChange}
                stockOpname={selectedStockOpname}
            />

            {/* MODAL CREATE / DRAFT */}
            <StockOpnameModal
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                locations={props.locations}
                discrepancy_reasons={props.discrepancy_reasons}
                stepOpname={stepOpname}
                setStepOpname={setStepOpname}
                stockOpname={stockOpname}
                setStockOpname={setStockOpname}
                rows={rows}
                setRows={setRows}
            />
        </>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_setting.title} />;

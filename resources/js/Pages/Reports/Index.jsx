import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ToolsTable from '@/Components/ToolsTable';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import { formatDateIndo } from '@/lib/utils';
import axios from 'axios';
import {
    IconArrowsDownUp,
    IconEye,
    IconFileSpreadsheet,
    IconFileTypePdf,
    IconListCheck,
    IconPackages,
    IconPencilCheck,
    IconRefresh,
    IconReportAnalytics,
    IconStack2,
} from '@tabler/icons-react';
import { useState } from 'react';
import ToolsFilterModal from '@/Components/ToolsFilterModal';
import ShowFilter from '@/Components/ShowFilter';
import { toast } from 'sonner';
import EmptyState from '@/Components/EmptyState';
import StockOpnameDetailModal from '@/Components/StockOpnameDetailModal';
import ToolStatusBadge from '@/Components/ToolStatusBadge';
import { Label } from '@/Components/ui/label';

export default function Index(props) {
    const defaultParams = {
        type: props.report_type ?? 'tools',
        location_id: '',
        category_id: '',
        created_by: '',
        status: '',
        inventory_type: '',
        used_by: '',
        date_from: '',
        date_to: '',
        load: '50',
        page: 1,
        location: '',
        category: '',
        status: '',
        inventory_type: '',
        used_by: '',
    };

    const [params, setParams] = useState(props.state);

    const [loadingExport, setLoadingExport] = useState(null);

    // Stock opname yang sedang dilihat detail
    const [selectedStockOpname, setSelectedStockOpname] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    UseFilter({
        route: route('reports.index'),
        values: params,
        only: ['report_type', 'tools', 'stockOpnames', 'summary', 'categories', 'state'],
    });

    const setType = (type) => setParams((prev) => ({ ...prev, type, page: 1 }));

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    const handleExport = async (kind) => {
        if (loadingExport) return;

        setLoadingExport(kind);

        try {
            const base =
                props.report_type === 'tools'
                    ? route(`reports.tools.export.${kind}`)
                    : route(`reports.stock-opnames.export.${kind}`);

            const response = await axios.get(base, {
                params:
                    props.report_type === 'tools'
                        ? {
                              location: params.location || '',
                              category_id: params.category_id || '',
                              status: params.status || '',
                              inventory_type: params.inventory_type || '',
                              used_by: params.used_by || '',
                          }
                        : {
                              location_id: params.location_id || '',
                              date_from: params.date_from || '',
                              date_to: params.date_to || '',
                              location: params.location || '',
                              created_by: params.created_by || '',
                          },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: response.headers['content-type'],
                }),
            );

            const link = document.createElement('a');

            link.href = url;

            const now = new Date();

            const date = now
                .toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                .replace(/\//g, '-');

            const time = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            link.download = `laporan-${props.report_type}-${date}_${time}.${kind === 'excel' ? 'xlsx' : 'pdf'}`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export gagal:', error);
            toast.error('Export gagal');
        } finally {
            setLoadingExport(null);
        }
    };

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
                <div className="mb-6">
                    <HeaderTitle
                        title={props.page_settings.title}
                        subtitle={props.page_settings.subtitle}
                        icon={IconReportAnalytics}
                    />
                </div>

                {/* Toggle jenis laporan */}
                <div className="mb-4 flex w-fit rounded-lg border p-0.5">
                    <Button
                        type="button"
                        size="sm"
                        variant={props.report_type === 'tools' ? 'blue' : 'ghost'}
                        onClick={() => setType('tools')}
                    >
                        Laporan Tools
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={props.report_type === 'stock-opnames' ? 'blue' : 'ghost'}
                        onClick={() => setType('stock-opnames')}
                    >
                        Laporan Stock Opname
                    </Button>
                </div>

                <Card>
                    <CardHeader className="mb-4 p-0">
                        <div className="flex w-full flex-col gap-4 px-6 py-4 md:flex-row md:items-center">
                            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center">
                                {props.report_type === 'stock-opnames' && (
                                    <>
                                        <Select
                                            value={params.location_id || 'all'}
                                            onValueChange={(v) =>
                                                setParams({ ...params, location: v === 'all' ? '' : v })
                                            }
                                        >
                                            <SelectTrigger className="w-full lg:w-fit">
                                                <SelectValue placeholder="Semua Lokasi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Lokasi</SelectItem>
                                                {props.locations.map((location) => (
                                                    <SelectItem key={location.id} value={String(location.slug)}>
                                                        {location.name}
                                                        {location.parent?.name && ` (${location.parent.name})`}
                                                        {location.children_count > 0 && ' — induk'}
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
                                    </>
                                )}

                                {props.report_type === 'tools' && (
                                    <>
                                        <ToolsFilterModal
                                            params={params}
                                            onApply={setParams}
                                            onClear={setParams}
                                            state={props.state}
                                            categories={props.categories}
                                            locations={props.locations}
                                            users={props.users}
                                            statuses={props.statuses}
                                            inventory_types={props.inventory_types}
                                        />
                                    </>
                                )}

                                {props.report_type === 'stock-opnames' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-full xl:flex xl:w-fit xl:items-center xl:gap-x-1">
                                            <Label htmlFor="date_from" className="md:hidden">
                                                Dari
                                            </Label>

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
                                        <span className="hidden text-sm text-muted-foreground md:block">s/d</span>

                                        <div className="w-full xl:flex xl:w-fit xl:items-center xl:gap-x-1">
                                            <Label htmlFor="date_to" className="md:hidden">
                                                Sampai
                                            </Label>

                                            <Input
                                                id="date_to"
                                                type="date"
                                                disabled={!params.date_from}
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
                                )}

                                {props.report_type == 'tools' && (
                                    <Select
                                        value={String(params?.load ?? '50')}
                                        size="sm"
                                        onValueChange={(value) =>
                                            setParams((prev) => ({
                                                ...prev,
                                                load: value,
                                                page: 1,
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-full lg:w-24">
                                            <SelectValue placeholder="Load" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {[50, 75, 100].map((number) => (
                                                <SelectItem key={number} value={String(number)}>
                                                    {number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex gap-2">
                                    <Button
                                        className="w-full lg:w-fit"
                                        variant="green"
                                        size="sm"
                                        disabled={loadingExport !== null}
                                        onClick={() => handleExport('excel')}
                                    >
                                        <IconFileSpreadsheet className="size-4" />

                                        {loadingExport === 'excel' ? 'Memproses...' : 'Export Excel'}
                                    </Button>

                                    {props.report_type == 'stock-opnames' && (
                                        <Button variant="red" onClick={() => setParams(defaultParams)} size="sm">
                                            <IconRefresh className="size-4" />
                                            Bersihkan
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <ShowFilter params={params} />
                    </CardHeader>

                    <CardContent className="px-6">
                        {/* Ringkasan */}
                        {props.report_type === 'tools' ? (
                            <>
                                <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-2">
                                    <StatCard icon={IconStack2} value={props.summary.total_tools} label="Total Tools" />
                                    <StatCard
                                        icon={IconPackages}
                                        value={props.summary.total_stock}
                                        label="Total Stok"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                                <StatCard
                                    icon={IconListCheck}
                                    value={props.summary.session_count}
                                    label="Sesi Opname"
                                />
                                <StatCard
                                    icon={IconStack2}
                                    value={props.summary.total_checked}
                                    label="Total Tool Dicek"
                                />
                                <StatCard
                                    icon={IconPackages}
                                    value={props.summary.total_mismatch}
                                    label="Total Selisih"
                                    warn
                                />
                            </div>
                        )}

                        {/* Konten */}
                        {props.report_type === 'tools' ? (
                            <>
                                <ToolsTable
                                    tools={props.tools.data}
                                    meta={props.tools.meta}
                                    auth={props.auth}
                                    onSortable={onSortable}
                                    showNote={true}
                                    showCategory
                                    readOnly
                                />
                            </>
                        ) : props.stockOpnames.data.length === 0 ? (
                            <EmptyState
                                icon={IconPencilCheck}
                                title="Tidak ada sesi Stock Opnames"
                                subtitle="Mulailah dengan membuat Stock Opnames baru"
                            />
                        ) : (
                            <div className="space-y-4">
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
                                        {props.stockOpnames.data.map((so, index) => (
                                            <TableRow key={so.id}>
                                                <TableCell>
                                                    {index +
                                                        1 +
                                                        (props.stockOpnames.meta.current_page - 1) *
                                                            props.stockOpnames.meta.per_page}
                                                </TableCell>

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
                                                        <p className="font-bold text-red-500">
                                                            {so.difference_count} tool
                                                        </p>
                                                    ) : (
                                                        'Tidak ada selisih'
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Button onClick={() => handleDetail(so)} variant="slate" size="sm">
                                                        <IconEye className="size-4" />
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                        {props.report_type === 'tools' ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan {props.tools.meta.to ?? 0} dari {props.tools.meta.total} tools
                                </p>
                                <div className="overflow-x-auto">
                                    {props.tools.meta.has_pages && (
                                        <PaginationTable meta={props.tools.meta} links={props.tools.links} />
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan{' '}
                                    <span className="font-medium text-blue-600">{props.stockOpnames.meta.to ?? 0}</span>{' '}
                                    dari {props.stockOpnames.meta.total} Stock Opnames
                                </p>

                                <div className="overflow-x-auto">
                                    {props.stockOpnames.meta.has_pages && (
                                        <PaginationTable
                                            meta={props.stockOpnames.meta}
                                            links={props.stockOpnames.links}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* MODAL DETAIL */}
            <StockOpnameDetailModal
                open={detailModalOpen}
                onOpenChange={handleDetailModalChange}
                stockOpname={selectedStockOpname}
            />
        </>
    );
}

function StatCard({ icon: Icon, value, label, warn = false }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border p-4">
            <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    warn ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                }`}
            >
                <Icon className="size-5" />
            </div>
            <div>
                <p className={`text-xl font-bold leading-none ${warn ? 'text-red-600' : ''}`}>{value ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

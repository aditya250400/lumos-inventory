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
    IconFileSpreadsheet,
    IconFileTypePdf,
    IconListCheck,
    IconPackages,
    IconRefresh,
    IconReportAnalytics,
    IconStack2,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function Index(props) {
    const defaultParams = {
        type: props.report_type ?? 'tools',
        location_id: '',
        category_id: '',
        date_from: '',
        date_to: '',
        load: '50',
        page: 1,
    };

    const [params, setParams] = useState(props.state);

    const [loadingExport, setLoadingExport] = useState(null);

    UseFilter({
        route: route('reports.index'),
        values: params,
        only: ['report_type', 'tools', 'groups', 'summary', 'categories', 'state'],
    });

    const setType = (type) => setParams((prev) => ({ ...prev, type, page: 1 }));

    const handleExport = async (kind) => {
        if (loadingExport) return;

        setLoadingExport(kind);

        try {
            const base =
                props.report_type === 'tools'
                    ? route(`reports.tools.export.${kind}`)
                    : route(`reports.stock-opnames.export.${kind}`);

            const response = await axios.get(base, {
                params: {
                    location_id: params.location_id || '',
                    category_id: params.category_id || '',
                    date_from: params.date_from || '',
                    date_to: params.date_to || '',
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
        } finally {
            setLoadingExport(null);
        }
    };

    return (
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
                            <Select
                                value={params.location_id || 'all'}
                                onValueChange={(v) => setParams({ ...params, location_id: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger className="w-full lg:w-56">
                                    <SelectValue placeholder="Semua Lokasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Lokasi</SelectItem>
                                    {props.locations.map((location) => (
                                        <SelectItem key={location.id} value={String(location.id)}>
                                            {location.name}
                                            {location.parent?.name && ` (${location.parent.name})`}
                                            {location.children_count > 0 && ' — induk'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {props.report_type === 'tools' && (
                                <Select
                                    value={params.category_id || 'all'}
                                    onValueChange={(v) => setParams({ ...params, category_id: v === 'all' ? '' : v })}
                                >
                                    <SelectTrigger className="w-full lg:w-48">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {props.categories?.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {props.report_type === 'stock-opnames' && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={params.date_from || ''}
                                        onChange={(e) => setParams({ ...params, date_from: e.target.value })}
                                    />
                                    <span className="text-sm text-muted-foreground">s/d</span>
                                    <Input
                                        type="date"
                                        value={params.date_to || ''}
                                        onChange={(e) => setParams({ ...params, date_to: e.target.value })}
                                    />
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

                            {props.report_type == 'tools' && (
                                <Button variant="red" onClick={() => setParams(defaultParams)} size="sm">
                                    <IconRefresh className="size-4" />
                                    Bersihkan
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
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

                                {/* <Button
                                    className="w-full lg:w-fit"
                                    variant="slate"
                                    size="sm"
                                    disabled={loadingExport !== null}
                                    onClick={() => handleExport('pdf')}
                                >
                                    <IconFileTypePdf className="size-4" />

                                    {loadingExport === 'pdf' ? 'Memproses...' : 'Export PDF'}
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-6">
                    {/* Ringkasan */}
                    {props.report_type === 'tools' ? (
                        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-2">
                            <StatCard icon={IconStack2} value={props.summary.total_tools} label="Total Tools" />
                            <StatCard icon={IconPackages} value={props.summary.total_stock} label="Total Stok" />
                        </div>
                    ) : (
                        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
                            <StatCard icon={IconListCheck} value={props.summary.session_count} label="Sesi Opname" />
                            <StatCard icon={IconStack2} value={props.summary.total_checked} label="Total Tool Dicek" />
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
                                showCategory
                                readOnly
                            />
                        </>
                    ) : props.groups.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            Tidak ada sesi stock opname pada rentang filter ini
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {props.groups.map((group) => (
                                <Card key={group.id} className={group.mismatch_count > 0 ? 'border-amber-300' : ''}>
                                    <div
                                        className={`flex items-center justify-between rounded-t-lg px-4 py-2 text-sm font-semibold ${
                                            group.mismatch_count > 0
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <span>{group.location}</span>
                                        <span className="font-normal">
                                            Opname #{group.id} &middot; {formatDateIndo(group.created_at)} &middot;{' '}
                                            {group.created_by}
                                        </span>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Stok Sistem</TableHead>
                                                <TableHead>Stok Fisik</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Alasan Selisih</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.details.map((detail, i) => (
                                                <TableRow
                                                    key={i}
                                                    className={detail.status === 'Tidak Sesuai' ? 'bg-red-50' : ''}
                                                >
                                                    <TableCell>{detail.tool_code}</TableCell>
                                                    <TableCell>{detail.tool_name}</TableCell>
                                                    <TableCell>{detail.system_stock}</TableCell>
                                                    <TableCell>{detail.physical_stock}</TableCell>
                                                    <TableCell
                                                        className={
                                                            detail.status === 'Tidak Sesuai'
                                                                ? 'font-semibold text-red-600'
                                                                : ''
                                                        }
                                                    >
                                                        {detail.status}
                                                    </TableCell>
                                                    <TableCell>{detail.discrepancy_reason ?? '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>

                {props.report_type === 'tools' && (
                    <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {props.tools.meta.to ?? 0} dari {props.tools.meta.total} tools
                        </p>
                        <div className="overflow-x-auto">
                            {props.tools.meta.has_pages && (
                                <PaginationTable meta={props.tools.meta} links={props.tools.links} />
                            )}
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
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

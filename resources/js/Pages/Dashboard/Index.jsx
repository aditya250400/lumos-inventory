import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    IconAlertTriangle,
    IconBuildingWarehouse,
    IconCategory,
    IconChecklist,
    IconClipboardCheck,
    IconClockHour4,
    IconLayout2,
    IconMapPin,
    IconPackage,
    IconTool,
    IconUserCircle,
} from '@tabler/icons-react';
import { Head, Link } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AppLayout from '@/Layouts/AppLayout';
import HeaderTitle from '@/Components/HeaderTitle';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const BLUES = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const STATUS_COLOR = {
    Tersedia: '#2563eb',
    Dipakai: '#60a5fa',
    Rusak: '#ef4444',
    Hilang: '#f59e0b',
    'Tidak Tersedia': '#94a3b8',
};

const STATUS_BADGE = {
    Rusak: 'bg-red-50 text-red-700 border-red-200',
    Hilang: 'bg-amber-50 text-amber-700 border-amber-200',
    'Tidak Tersedia': 'bg-slate-100 text-slate-700 border-slate-200',
};

const nf = new Intl.NumberFormat('id-ID');
const fmt = (n) => nf.format(Number(n ?? 0));

const fmtDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '-';

function StatusBadge({ status }) {
    return (
        <Badge variant="outline" className={STATUS_BADGE[status] ?? 'border-blue-200 bg-blue-50 text-blue-700'}>
            {status}
        </Badge>
    );
}

function StatCard({ icon: Icon, label, value, hint, tone = 'blue' }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
                <div className={`rounded-lg p-2.5 ${tones[tone]}`}>
                    <Icon size={22} stroke={1.8} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
                    {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function Panel({ icon: Icon, title, description, children, className = '' }) {
    return (
        <Card className={`border-slate-200 shadow-sm ${className}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    {Icon && <Icon size={18} className="text-blue-600" stroke={1.8} />}
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function Empty({ children }) {
    return (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
            {children}
        </div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
            <p className="font-medium text-slate-900">{row.label ?? label ?? row.name}</p>
            <p className="text-slate-600">Stok: {fmt(row.total)}</p>
            {row.tools !== undefined && <p className="text-slate-600">Jenis alat: {fmt(row.tools)}</p>}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Charts                                                             */
/* ------------------------------------------------------------------ */

function DonutChart({ data, colorFor }) {
    if (!data?.length) return <Empty>Belum ada data.</Empty>;
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="total" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {data.map((item, i) => (
                            <Cell key={item.name} fill={colorFor(item.name, i)} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function HorizontalBars({ data, nameKey = 'name', height = 280 }) {
    if (!data?.length) return <Empty>Belum ada data.</Empty>;
    return (
        <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <YAxis
                        type="category"
                        dataKey={nameKey}
                        width={130}
                        tick={{ fontSize: 12, fill: '#334155' }}
                        tickFormatter={(v) => (v.length > 18 ? v.slice(0, 17) + '…' : v)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#eff6ff' }} />
                    <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Lists                                                              */
/* ------------------------------------------------------------------ */

function ToolList({ tools, dateKey, empty }) {
    if (!tools?.length) return <Empty>{empty}</Empty>;
    return (
        <ul className="divide-y divide-slate-100">
            {tools.map((tool) => (
                <li key={tool.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                        <Link
                            href={route('tools.show', tool.tool_code)}
                            className="block truncate text-sm font-medium text-slate-900 hover:text-blue-600"
                        >
                            {tool.name}
                        </Link>
                        <p className="truncate text-xs text-slate-500">
                            {tool.tool_code} · {tool.category_name ?? 'Tanpa kategori'} ·{' '}
                            {tool.location_name ?? 'Tanpa lokasi'}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <StatusBadge status={tool.status} />
                        <p className="mt-1 text-xs text-slate-500">
                            Stok {fmt(tool.stock)} · {fmtDate(tool[dateKey])}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Dashboard({
    summary,
    charts,
    latestProblemTools,
    latestTools,
    topHolders,
    canViewOpname,
    opname,
}) {
    const lastOpname = opname?.lastOpname;

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={'Dashboard'}
                        subtitle={'Menampilkan semua statistik pada platform'}
                        icon={IconLayout2}
                    />
                </div>
                <div className="mx-auto max-w-7xl space-y-6 py-6">
                    {/* Summary */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={IconTool}
                            label="Total alat"
                            value={fmt(summary.totalTools)}
                            hint="Jenis alat terdaftar"
                        />
                        <StatCard
                            icon={IconPackage}
                            label="Total stok"
                            value={fmt(summary.totalStock)}
                            hint="Seluruh unit"
                        />
                        <StatCard
                            icon={IconAlertTriangle}
                            label="Alat bermasalah"
                            value={fmt(summary.problemTools)}
                            hint={`${fmt(summary.problemStock)} unit rusak, hilang, atau tidak tersedia`}
                            tone="red"
                        />
                        {canViewOpname && (
                            <StatCard
                                icon={IconClipboardCheck}
                                label="Selisih opname terakhir"
                                value={fmt(summary.lastDiscrepancy)}
                                hint={`${fmt(summary.lastDiscrepancyUnits)} unit selisih`}
                                tone="amber"
                            />
                        )}
                    </div>

                    {/* Status + Type */}
                    <div className="grid gap-4 lg:grid-cols-5">
                        <Panel
                            icon={IconChecklist}
                            title="Stok per status"
                            description="Jumlah unit berdasarkan status alat"
                            className="lg:col-span-3"
                        >
                            {charts.status?.length ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.status}>
                                            <CartesianGrid vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} />
                                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#eff6ff' }} />
                                            <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={36}>
                                                {charts.status.map((item) => (
                                                    <Cell key={item.name} fill={STATUS_COLOR[item.name] ?? '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <Empty>Belum ada data.</Empty>
                            )}
                        </Panel>

                        <Panel
                            icon={IconBuildingWarehouse}
                            title="Internal vs eksternal"
                            description="Komposisi stok berdasarkan kepemilikan"
                            className="lg:col-span-2"
                        >
                            <DonutChart data={charts.inventoryType} colorFor={(_, i) => BLUES[i * 2 + 1] ?? BLUES[2]} />
                        </Panel>
                    </div>

                    {/* Category + Location */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Panel icon={IconCategory} title="Stok per kategori" description="Urut dari stok terbanyak">
                            <HorizontalBars data={charts.category?.slice(0, 8)} />
                        </Panel>
                        <Panel icon={IconMapPin} title="Stok per lokasi" description="8 lokasi dengan stok terbanyak">
                            <HorizontalBars data={charts.location?.slice(0, 8)} nameKey="label" />
                        </Panel>
                    </div>

                    {/* Lists */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Panel
                            icon={IconAlertTriangle}
                            title="Alat bermasalah terbaru"
                            description="Rusak, hilang, atau tidak tersedia"
                        >
                            <ToolList
                                tools={latestProblemTools}
                                dateKey="updated_at"
                                empty="Tidak ada alat bermasalah."
                            />
                        </Panel>
                        <Panel icon={IconTool} title="Alat terbaru" description="5 alat yang terakhir ditambahkan">
                            <ToolList tools={latestTools} dateKey="created_at" empty="Belum ada alat." />
                        </Panel>
                    </div>

                    <Panel
                        icon={IconUserCircle}
                        title="Pemegang alat terbanyak"
                        description="Pengguna dengan jumlah alat terbanyak"
                    >
                        {topHolders?.length ? (
                            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                {topHolders.map((holder, i) => (
                                    <li
                                        key={holder.id}
                                        className="rounded-lg border border-slate-200 bg-blue-50/40 p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                                {i + 1}
                                            </span>
                                            <span className="truncate text-sm font-medium text-slate-900">
                                                {holder.name}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-600">
                                            {fmt(holder.total_tools)} alat · {fmt(holder.total_stock)} unit
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Empty>Belum ada alat yang dipegang pengguna.</Empty>
                        )}
                    </Panel>

                    {/* Stock opname */}
                    {canViewOpname && (
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                                <IconClipboardCheck size={20} className="text-blue-600" />
                                Stock opname
                            </h3>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <Panel title="Opname terakhir" description="Sesi berstatus selesai">
                                    {lastOpname ? (
                                        <dl className="space-y-3 text-sm">
                                            <div>
                                                <dt className="text-slate-500">Lokasi</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {lastOpname.location_name}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Tanggal</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {fmtDate(lastOpname.created_at)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-slate-500">Dibuat oleh</dt>
                                                <dd className="font-medium text-slate-900">
                                                    {lastOpname.created_by_name ?? '-'}
                                                </dd>
                                            </div>
                                            <div className="flex gap-6 border-t border-slate-100 pt-3">
                                                <div>
                                                    <dd className="text-xl font-semibold text-slate-900">
                                                        {fmt(opname.discrepancyTotal)}
                                                    </dd>
                                                    <dt className="text-xs text-slate-500">Item selisih</dt>
                                                </div>
                                                <div>
                                                    <dd className="text-xl font-semibold text-slate-900">
                                                        {fmt(opname.discrepancyUnits)}
                                                    </dd>
                                                    <dt className="text-xs text-slate-500">Unit selisih</dt>
                                                </div>
                                            </div>
                                        </dl>
                                    ) : (
                                        <Empty>Belum ada opname selesai.</Empty>
                                    )}
                                </Panel>

                                <Panel
                                    title="Penyebab selisih"
                                    description="Dari opname terakhir"
                                    className="lg:col-span-2"
                                >
                                    {opname.discrepancyReasons?.length ? (
                                        <div className="h-56">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={opname.discrepancyReasons}
                                                    layout="vertical"
                                                    margin={{ left: 8, right: 16 }}
                                                >
                                                    <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                                                    <XAxis
                                                        type="number"
                                                        allowDecimals={false}
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                    />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        width={130}
                                                        tick={{ fontSize: 12, fill: '#334155' }}
                                                    />
                                                    <Tooltip
                                                        cursor={{ fill: '#eff6ff' }}
                                                        formatter={(v) => [fmt(v), 'Item']}
                                                    />
                                                    <Bar
                                                        dataKey="total"
                                                        fill="#3b82f6"
                                                        radius={[0, 4, 4, 0]}
                                                        barSize={16}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <Empty>Tidak ada selisih pada opname terakhir.</Empty>
                                    )}
                                </Panel>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <Panel title="Aktivitas opname terbaru" description="5 sesi selesai terakhir">
                                    {opname.recentSessions?.length ? (
                                        <ul className="divide-y divide-slate-100">
                                            {opname.recentSessions.map((s) => (
                                                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                            {s.location_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {fmtDate(s.created_at)} · {s.created_by_name ?? '-'}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 text-right text-xs text-slate-600">
                                                        <p>{fmt(s.total_items)} item</p>
                                                        <p
                                                            className={
                                                                s.total_discrepancies > 0
                                                                    ? 'text-amber-600'
                                                                    : 'text-blue-600'
                                                            }
                                                        >
                                                            {fmt(s.total_discrepancies)} selisih
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Empty>Belum ada sesi opname.</Empty>
                                    )}
                                </Panel>

                                <Panel
                                    icon={IconClockHour4}
                                    title="Lokasi perlu opname"
                                    description="Belum pernah opname atau lebih dari 30 hari"
                                >
                                    {opname.locationsNeedingOpname?.length ? (
                                        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                                            {opname.locationsNeedingOpname.map((l) => (
                                                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                            {l.parent_name ? `${l.name} - ${l.parent_name}` : l.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Terakhir: {fmtDate(l.last_opname)}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            l.days_ago === null
                                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                                : 'border-amber-200 bg-amber-50 text-amber-700'
                                                        }
                                                    >
                                                        {l.days_ago === null
                                                            ? 'Belum pernah'
                                                            : `${fmt(l.days_ago)} hari lalu`}
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Empty>Semua lokasi sudah diopname dalam 30 hari terakhir.</Empty>
                                    )}
                                </Panel>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} title={'Dashboard'} />;

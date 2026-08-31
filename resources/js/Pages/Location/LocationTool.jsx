import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ToolCard from '@/Components/ToolCard';
import ToolsTable from '@/Components/ToolsTable';
import ViewSwitcher from '@/Components/ViewSwitcher';
import ShowFilter from '@/Components/ShowFilter';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useViewMode from '@/hooks/UseViewMode';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconArrowLeft, IconDoor, IconLocation, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import EditToolModal from '@/Components/EditToolModal';
import CreateToolModal from '@/Components/CreateToolModal';
import ToolDetailModal from '../Tool/ToolDetailModal';

export default function LocationTool({
    categories,
    statuses,
    inventory_types,
    users,
    auth,
    location,
    locations,
    tools: toolsProp,
    state,
}) {
    const { data: tools, meta: toolsMeta, links: toolsLinks } = toolsProp;

    const [params, setParams] = useState(state);

    const [view, setView] = useViewMode('location-tools-view', 'table');
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailTool, setDetailTool] = useState(null);

    const onDetailTrigger = (tool) => {
        setDetailTool(tool);
        setDetailOpen(true);
    };

    const onEditTrigger = (tool) => {
        setSelectedTool(tool);
        setEditOpen(true);
    };

    /*
     * ============================================================
     * SCOPE
     * ============================================================
     *
     * direct = hanya tools yang langsung berada di location ini
     * all    = tools location ini + seluruh sub-location
     */
    const isDirect = params?.scope === 'direct';

    /*
     * ============================================================
     * DYNAMIC TEXT
     * ============================================================
     */
    const toolsSubtitle = isDirect
        ? `Tools yang berada langsung di ${location.name}`
        : `Semua tools yang berada di ${location.name} dan seluruh sub lokasinya`;

    const emptySubtitle = isDirect
        ? `Belum ada tools yang berada langsung di ${location.name}`
        : `Belum ada tools di ${location.name} maupun sub lokasinya`;

    /*
     * ============================================================
     * FILTER TOOLS
     * ============================================================
     */
    UseFilter({
        route: route('location.tools.index', [location.slug]),
        values: params,
        only: ['tools'],
    });

    /*
     * ============================================================
     * SORTING
     * ============================================================
     */
    const onSortable = (field) => {
        setParams((prev) => ({
            ...prev,
            field,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    /*
     * ============================================================
     * RESET FILTER
     * ============================================================
     */
    const resetFilter = () => {
        setParams(state);
    };

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                {/* ====================================================
                    HEADER
                ==================================================== */}
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={location.name}
                        subtitle={
                            isDirect
                                ? `Tools langsung di lokasi ${location.name}`
                                : `Semua tools di lokasi ${location.name} dan sub lokasinya`
                        }
                        icon={IconLocation}
                    />

                    <Button asChild variant="blue" size="xl" className="w-full lg:w-auto">
                        <Link href={route('location.show', [location.slug])}>
                            <IconArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* ====================================================
                    INFO LOCATION
                ==================================================== */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">{location.name}</h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {isDirect
                                ? `Informasi tools yang berada langsung di ${location.name}`
                                : `Informasi seluruh tools yang berada di ${location.name} dan sub lokasinya`}
                        </p>

                        {/* Pemilik */}
                        {location.user?.name && (
                            <div className="mt-3">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    Pemilik: {location.user.name}
                                </span>
                            </div>
                        )}

                        {/* Statistik */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {location.tools_count} Total Tools
                            </span>

                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {location.total_stock} Total Stok
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* ====================================================
                    TOOLS
                ==================================================== */}
                <Card>
                    <CardHeader className="mb-4 p-0">
                        {/* Header Tools */}
                        <div className="flex w-full flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="font-semibold">Daftar Tools {location.name}</h2>

                                <p className="text-sm text-muted-foreground">{toolsSubtitle}</p>
                            </div>

                            {/* Table / Card Switcher */}
                            <ViewSwitcher value={view} onChange={setView} />
                        </div>

                        {/* ====================================================
                            FILTER
                        ==================================================== */}
                        <div className="flex w-full flex-col gap-4 px-6 pb-4 lg:flex-row lg:items-center">
                            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center">
                                <Input
                                    size="sm"
                                    className="w-full lg:w-1/4"
                                    placeholder="search"
                                    value={params?.search ?? ''}
                                    onChange={(e) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                />

                                <Select
                                    value={String(params?.load ?? 10)}
                                    size="sm"
                                    onValueChange={(value) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            load: Number(value),
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full lg:w-24">
                                        <SelectValue placeholder="Load" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {[10, 25, 50, 75, 100].map((number) => (
                                            <SelectItem key={number} value={String(number)}>
                                                {number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="red" onClick={resetFilter} size="sm">
                                    <IconRefresh className="size-4" />
                                    Bersihkan
                                </Button>
                            </div>

                            {hasAnyPermissions(auth.permissions, ['tools.create']) && (
                                <Button
                                    variant="blue"
                                    size="sm"
                                    onClick={() => setCreateOpen(true)}
                                    className="w-full shrink-0 lg:w-auto"
                                >
                                    <IconPlus className="size-4" />
                                    Tambah Tool
                                </Button>
                            )}
                        </div>

                        {/* ====================================================
                            ACTIVE FILTER
                        ==================================================== */}
                        <ShowFilter params={params} />
                    </CardHeader>

                    {/* ====================================================
                        TOOLS CONTENT
                    ==================================================== */}
                    <CardContent className="[&-td]:whitespace-nowrap [&-td]:p-0 [&-th]:px-6">
                        {tools.length === 0 ? (
                            <EmptyState icon={IconDoor} title="Belum ada tools" subtitle={emptySubtitle} />
                        ) : view === 'card' ? (
                            /*
                             * ====================================================
                             * CARD VIEW
                             * ====================================================
                             */
                            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {tools.map((tool) => (
                                    <ToolCard
                                        onDetailTrigger={onDetailTrigger}
                                        onEditTrigger={onEditTrigger}
                                        key={tool.id}
                                        tool={tool}
                                        auth={auth}
                                    />
                                ))}
                            </div>
                        ) : (
                            /*
                             * ====================================================
                             * TABLE VIEW
                             * ====================================================
                             */
                            <ToolsTable
                                tools={tools}
                                meta={toolsMeta}
                                auth={auth}
                                onDetailTrigger={onDetailTrigger}
                                onEditTrigger={onEditTrigger}
                                onSortable={onSortable}
                                dynamicColumns={[]}
                                showCategory={true}
                                showNote={true}
                            />
                        )}
                    </CardContent>

                    {/* ====================================================
                        PAGINATION
                    ==================================================== */}
                    <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-blue-600">{toolsMeta.to ?? 0}</span> dari{' '}
                            {toolsMeta.total} tools
                        </p>

                        <div className="overflow-x-auto">
                            {toolsMeta.has_pages && <PaginationTable meta={toolsMeta} links={toolsLinks} />}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <EditToolModal
                open={editOpen}
                onOpenChange={setEditOpen}
                tool={selectedTool}
                categories={categories}
                locations={locations}
                lockCategory={null}
                lockLocation={location}
                users={users}
                action="PUT"
                inventory_types={inventory_types}
                statuses={statuses}
            />
            <CreateToolModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                categories={categories}
                locations={locations}
                users={users}
                action={route('tools.store')}
                method={'POST'}
                inventory_types={inventory_types}
                statuses={statuses}
                lockLocation={location}
            />
            <ToolDetailModal open={detailOpen} onOpenChange={setDetailOpen} tool={detailTool} />
        </>
    );
}

LocationTool.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

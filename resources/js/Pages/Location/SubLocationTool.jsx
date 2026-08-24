import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ToolCard from '@/Components/ToolCard';
import ToolsTable from '@/Components/ToolsTable';
import ViewSwitcher from '@/Components/ViewSwitcher';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useViewMode from '@/hooks/UseViewMode';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { IconArrowLeft, IconDoor, IconLocation, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import ShowFilter from '@/Components/ShowFilter';
import hasAnyPermissions from '@/lib/utils';
import CreateToolModal from '@/Components/CreateToolModal';
import EditToolModal from '@/Components/EditToolModal';

export default function SubLocationTool({
    auth,
    location,
    subLocation,
    tools: toolsProp,
    state,
    locations,
    categories,
    statuses,
    inventory_types,
    users,
}) {
    const { data: tools, meta: toolsMeta, links: toolsLinks } = toolsProp;

    const [params, setParams] = useState(state);

    const [view, setView] = useViewMode('sub-location-tools-view', 'table');

    const [createOpen, setCreateOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    const onEditTrigger = (tool) => {
        setSelectedTool(tool);
        setEditOpen(true);
    };

    console.log(categories);

    /*
     * ============================================================
     * FILTER TOOLS
     * ============================================================
     */
    UseFilter({
        route: route('location.sub-locations.tools.index', [location.slug, subLocation.slug]),
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
                        title={subLocation.name}
                        subtitle={`Sub-lokasi dari ${location.name}`}
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
                    INFO SUB-LOCATION
                ==================================================== */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">{subLocation.name}</h1>

                        <p className="mt-1 text-sm text-muted-foreground">Detail sub-lokasi dari {location.name}</p>

                        {/* Pemilik */}
                        {subLocation.user?.name && (
                            <div className="mt-3">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    Pemilik: {subLocation.user.name}
                                </span>
                            </div>
                        )}

                        {/* Statistik */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {subLocation.tools_count} Total Tools
                            </span>

                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {subLocation.total_stock} Total Stok
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
                                <h2 className="font-semibold">Daftar Tools {subLocation.name}</h2>

                                <p className="text-sm text-muted-foreground">Tools yang berada di {subLocation.name}</p>
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
                                    value={params?.search}
                                    onChange={(e) =>
                                        setParams((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                />

                                <Select
                                    value={params?.load}
                                    size="sm"
                                    onValueChange={(e) =>
                                        setParams({
                                            ...params,
                                            load: e,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full lg:w-24">
                                        <SelectValue placeholder="Load" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {[10, 25, 50, 75, 100].map((number, index) => (
                                            <SelectItem key={index} value={number}>
                                                {number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="red" onClick={() => setParams(state)} size="sm">
                                    <IconRefresh className="size-4" />
                                    Bersihkan
                                </Button>
                            </div>

                            {hasAnyPermissions(auth.permissions, ['tools.create']) && (
                                <Button
                                    onClick={() => setCreateOpen(true)}
                                    variant="blue"
                                    size="sm"
                                    className="w-full shrink-0 lg:w-auto"
                                >
                                    <IconPlus className="size-4" />
                                    Tambah Tool
                                </Button>
                            )}
                        </div>
                        {/* show filter */}
                        <ShowFilter params={params} />
                    </CardHeader>

                    {/* ====================================================
                        TOOLS CONTENT
                    ==================================================== */}
                    <CardContent className="[&-td]:whitespace-nowrap [&-td]:p-0 [&-th]:px-6">
                        {tools.length === 0 ? (
                            <EmptyState
                                icon={IconDoor}
                                title="Belum ada tools"
                                subtitle={`Belum ada tools di ${subLocation.name}`}
                            />
                        ) : view === 'card' ? (
                            /*
                             * ====================================================
                             * CARD VIEW
                             * ====================================================
                             */
                            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {tools.map((tool) => (
                                    <ToolCard onEditTrigger={onEditTrigger} key={tool.id} tool={tool} auth={auth} />
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
                lockLocation={{ id: subLocation.id, name: subLocation.name }}
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
                lockLocation={{ id: subLocation.id, name: subLocation.name }}
            />
        </>
    );
}

SubLocationTool.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ToolCard from '@/Components/ToolCard';
import ViewSwitcher from '@/Components/ViewSwitcher';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import useViewMode from '@/hooks/UseViewMode';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconBox,
    IconCategory2,
    IconDoor,
    IconPackages,
    IconPencil,
    IconPlus,
    IconRefresh,
    IconStack2,
    IconTag,
    IconTrash,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import AttributeModal from './AttributeModal';
import StatCard from '@/Components/StatCard';
import ShowFilter from '@/Components/ShowFilter';
import ToolsTable from '@/Components/ToolsTable';
import CreateToolModal from '@/Components/CreateToolModal';
import EditToolModal from '@/Components/EditToolModal';
import ToolDetailModal from '../Tool/ToolDetailModal';

export default function Show(
    { auth, category, tools: toolsProp, categories, locations, users, attributes, state, inventory_types, statuses },
    props,
) {
    const { data: tools, meta: toolsMeta, links: toolsLinks } = toolsProp;

    /*
     * ============================================================
     * ACTIVE TAB
     * ============================================================
     *
     * Setiap category punya localStorage key sendiri.
     *
     * Contoh:
     * category-elektronik-active-tab = "tools"
     * category-perkakas-active-tab = "attributes"
     */
    const tabStorageKey = `category-${category.slug}-active-tab`;

    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') {
            return 'tools';
        }

        return localStorage.getItem(tabStorageKey) || 'tools';
    });

    /*
     * Simpan tab setiap kali berubah.
     */
    useEffect(() => {
        localStorage.setItem(tabStorageKey, activeTab);
    }, [activeTab, tabStorageKey]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAtt, setEditingAtt] = useState(null);
    const [view, setView] = useViewMode('category-detail-tools-view', 'table');
    const [params, setParams] = useState(state);
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
    const openCreate = () => {
        setEditingAtt(null);
        setModalOpen(true);
    };

    const openEdit = (attribute) => {
        setEditingAtt(attribute);
        setModalOpen(true);
    };

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    UseFilter({
        route: route('category.show', [category.slug]),
        values: params,
        only: ['tools'],
    });

    /*
     * Kolom dinamis diambil dari daftar definisi attribute kategori ini.
     */
    const dynamicColumns = useMemo(() => attributes.map((attr) => attr.field_name), [attributes]);

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                {/* Header */}
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={category.name}
                        subtitle={`Detail kategori ${category.name}`}
                        icon={IconCategory2}
                    />

                    <Button asChild variant="blue" size="xl" className="w-full lg:w-auto">
                        <Link href={route('category.index')}>
                            <IconArrowLeft className="size-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Header info kategori */}
                <div className="grid grid-cols-2 gap-3 pb-6 lg:grid-cols-4">
                    <StatCard icon={IconBox} value={category.tools_count} label="Total Tools" />
                    <StatCard icon={IconPackages} value={category.tools_sum_stock} label="Total Stok" />
                    <StatCard icon={IconTag} value={category.attributes_count} label="Attribute" />
                    <StatCard icon={IconStack2} value={category.attribute_values_count} label="Attribute Values" />
                </div>

                <Card>
                    <CardHeader
                        className={`mb-4 p-0 ${
                            activeTab === 'attributes' ? 'flex flex-row items-center justify-between' : ''
                        }`}
                    >
                        <div className="flex w-full flex-col gap-4 px-6 py-4 lg:w-full lg:flex-row lg:items-center lg:justify-between">
                            {/* Tab switch: Daftar Tools / Daftar Attribute */}
                            <div className="flex rounded-lg border p-0.5">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={activeTab === 'attributes' ? 'blue' : 'ghost'}
                                    onClick={() => setActiveTab('attributes')}
                                >
                                    Daftar Attribute
                                </Button>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant={activeTab === 'tools' ? 'blue' : 'ghost'}
                                    onClick={() => setActiveTab('tools')}
                                >
                                    Daftar Tools {category.name}
                                </Button>
                            </div>

                            {/* Tabel/Grid switch cuma muncul di tab Tools */}
                            {activeTab === 'tools' && <ViewSwitcher value={view} onChange={setView} />}
                        </div>

                        {/* Tools actions */}
                        {activeTab === 'tools' && (
                            <>
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
                            </>
                        )}

                        {/* Attribute actions */}
                        {activeTab === 'attributes' && (
                            <div className="flex justify-end px-6 pb-4">
                                {hasAnyPermissions(auth.permissions, ['category.update']) && (
                                    <Button onClick={openCreate} variant="blue" size="sm">
                                        <IconPlus className="size-4" />
                                        Tambah Attribute
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="[&-td]:whitespace-nowrap [&-td]:p-0 [&-th]:px-6">
                        {activeTab === 'tools' ? (
                            /*
                             * ============================================================
                             * TOOLS
                             * ============================================================
                             */

                            tools.length === 0 ? (
                                <EmptyState
                                    icon={IconDoor}
                                    title="Belum ada tools"
                                    subtitle={`Belum ada tools di kategori ${category.name}`}
                                />
                            ) : view === 'card' ? (
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
                                <ToolsTable
                                    tools={tools}
                                    meta={toolsMeta}
                                    auth={auth}
                                    onDetailTrigger={onDetailTrigger}
                                    onEditTrigger={onEditTrigger}
                                    onSortable={onSortable}
                                    showNote={true}
                                    dynamicColumns={dynamicColumns}
                                />
                            )
                        ) : /*
                         * ============================================================
                         * ATTRIBUTES
                         * ============================================================
                         */
                        attributes.length === 0 ? (
                            <EmptyState
                                icon={IconDoor}
                                title="Belum ada attribute"
                                subtitle={`Belum ada attribute untuk kategori ${category.name}`}
                            />
                        ) : (
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Nama Field</TableHead>
                                        <TableHead>Total Value</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {attributes.map((attribute, index) => (
                                        <TableRow key={attribute.id}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>{attribute.field_name}</TableCell>

                                            <TableCell>{attribute.values_count}</TableCell>

                                            <TableCell>
                                                <div className="flex items-center justify-start gap-x-1">
                                                    {hasAnyPermissions(auth.permissions, ['category.update']) && (
                                                        <Button
                                                            onClick={() => openEdit(attribute)}
                                                            variant="blue"
                                                            size="sm"
                                                        >
                                                            <IconPencil className="size-4" />
                                                            Edit
                                                        </Button>
                                                    )}

                                                    {hasAnyPermissions(auth.permissions, ['category.update']) && (
                                                        <AlertAction
                                                            trigger={
                                                                <Button variant="red" size="sm">
                                                                    <IconTrash className="size-4" />
                                                                    Hapus
                                                                </Button>
                                                            }
                                                            action={() =>
                                                                deleteAction(
                                                                    route('category.attributes.destroy', [
                                                                        category.slug,
                                                                        attribute.id,
                                                                    ]),
                                                                )
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

                    {/* Pagination tools */}
                    {activeTab === 'tools' && (
                        <CardFooter className="flex w-full flex-col items-center justify-between gap-y-2 border-t py-3 lg:flex-row">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan <span className="font-medium text-blue-600">{toolsMeta.to ?? 0}</span> dari{' '}
                                {toolsMeta.total} tools
                            </p>

                            <div className="overflow-x-auto">
                                {toolsMeta.has_pages && <PaginationTable meta={toolsMeta} links={toolsLinks} />}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

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
                lockCategory={{ id: category.id, name: category.name }}
                lockLocation={null}
            />
            <EditToolModal
                open={editOpen}
                onOpenChange={setEditOpen}
                tool={selectedTool}
                categories={categories}
                locations={locations}
                lockCategory={{ id: category.id, name: category.name }}
                users={users}
                action="PUT"
                inventory_types={inventory_types}
                statuses={statuses}
            />
            {/* Attribute Modal */}
            <AttributeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                attribute={editingAtt}
                category={category}
                action={
                    editingAtt
                        ? route('category.attributes.update', [category.slug, editingAtt])
                        : route('category.attributes.store', [category.slug])
                }
                method={editingAtt ? 'put' : 'post'}
            />

            <ToolDetailModal open={detailOpen} onOpenChange={setDetailOpen} tool={detailTool} />
        </>
    );
}

Show.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

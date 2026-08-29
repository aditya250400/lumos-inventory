import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
import PaginationTable from '@/Components/PaginationTable';
import ShowFilter from '@/Components/ShowFilter';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import UseFilter from '@/hooks/UseFilter';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconCategory2, IconDoor, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ViewSwitcher from '@/Components/ViewSwitcher';
import useViewMode from '@/hooks/UseViewMode';
import ToolsTable from '@/Components/ToolsTable';
import ToolsFilterModal from '@/Components/ToolsFilterModal';
import ToolCard from '@/Components/ToolCard';
import CreateToolModal from '@/Components/CreateToolModal';
import EditToolModal from '@/Components/EditToolModal';
import ToolDetailModal from './ToolDetailModal';

export default function Index(props) {
    const { data: tools, meta: toolsMeta, links: toolsLinks } = props.tools;
    const [params, setParams] = useState(props.state);
    const [selectedTool, setSelectedTool] = useState(null);
    const [view, setView] = useViewMode('tools-index-view', 'card');
    const [editOpen, setEditOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailTool, setDetailTool] = useState(null);

    tools;

    const onEditTrigger = (tool) => {
        setSelectedTool(tool);
        setEditOpen(true);
    };

    const onDetailTrigger = (tool) => {
        setDetailTool(tool);
        setDetailOpen(true);
    };

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    UseFilter({
        route: route('tools.index'),
        values: params,
        only: ['tools'],
    });

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={props.page_settings.title}
                        subtitle={props.page_settings.subtitle}
                        icon={IconCategory2}
                    />
                    {hasAnyPermissions(props.auth.permissions, ['tools.create']) && (
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
                    <CardHeader className={'mb-4 p-0'}>
                        <div className="flex w-full flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center">
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
                                        {[50, 75, 100].map((number, index) => (
                                            <SelectItem key={index} value={number}>
                                                {number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <ToolsFilterModal
                                    params={params}
                                    onApply={setParams}
                                    onClear={setParams}
                                    categories={props.categories}
                                    locations={props.locations}
                                    users={props.users}
                                    statuses={props.statuses}
                                    inventory_types={props.inventory_types}
                                />
                            </div>

                            <ViewSwitcher value={view} onChange={setView} />
                        </div>
                        {/* show filter */}
                        <ShowFilter params={params} />
                    </CardHeader>
                    <CardContent className="[&-td]:whitespace-nowrap [&-td]:p-0 [&-th]:px-6">
                        {tools.length === 0 ? (
                            <EmptyState
                                icon={IconDoor}
                                title="Belum ada tools"
                                subtitle={`Belum ada tools, mulailah dengan membuat tools baru`}
                            />
                        ) : view === 'card' ? (
                            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {tools.map((tool) => (
                                    <ToolCard
                                        onEditTrigger={onEditTrigger}
                                        onDetailTrigger={onDetailTrigger}
                                        key={tool.id}
                                        tool={tool}
                                        auth={props.auth}
                                    />
                                ))}
                            </div>
                        ) : (
                            <ToolsTable
                                tools={tools}
                                meta={toolsMeta}
                                auth={props.auth}
                                onSortable={onSortable}
                                onDetailTrigger={onDetailTrigger}
                                showNote={true}
                                onEditTrigger={onEditTrigger}
                                showCategory={true}
                            />
                        )}
                    </CardContent>

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

            <CreateToolModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                categories={props.categories}
                locations={props.locations}
                users={props.users}
                action={props.action}
                method={props.method}
                inventory_types={props.inventory_types}
                statuses={props.statuses}
                lockCategory={null}
                lockLocation={null}
            />
            <EditToolModal
                open={editOpen}
                onOpenChange={setEditOpen}
                tool={selectedTool}
                categories={props.categories}
                locations={props.locations}
                users={props.users}
                action="PUT"
                inventory_types={props.inventory_types}
                statuses={props.statuses}
            />

            <ToolDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                tool={detailTool}
                auth={props.auth}
                categories={props.categories}
                locations={props.locations}
                users={props.users}
                inventory_types={props.inventory_types}
                statuses={props.statuses}
            />
        </>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

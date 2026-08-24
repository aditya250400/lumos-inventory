import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import HeaderTitle from '@/Components/HeaderTitle';
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
    IconCategory2,
    IconDoor,
    IconLocationSearch,
    IconPencil,
    IconPlus,
    IconRefresh,
    IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import ViewSwitcher from '@/Components/ViewSwitcher';
import useViewMode from '@/hooks/UseViewMode';
import CategoryCard from '@/Components/CategoryCard';

export default function Index(props) {
    const { data: categories, meta, links } = props.categories;
    const [params, setParams] = useState(props.state);
    const [createOpen, setCreateOpen] = useState(false);
    const [view, setView] = useViewMode('category-index-view', 'card');
    const [editingCategory, setEditingCategory] = useState(null);

    const onSortable = (field) => {
        setParams({
            ...params,
            field: field,
            direction: params.direction === 'asc' ? 'desc' : 'asc',
        });
    };

    UseFilter({
        route: route('category.index'),
        values: params,
        only: ['categories'],
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
                    {hasAnyPermissions(props.auth.permissions, ['category.create']) && (
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
                            <ViewSwitcher value={view} onChange={setView} />
                        </div>
                        {/* show filter */}
                        <ShowFilter params={params} />
                    </CardHeader>

                    <CardContent className="[&-td]: p-0 [&-td]:whitespace-nowrap [&-th]:px-6">
                        {categories.length === 0 ? (
                            <EmptyState
                                icon={IconDoor}
                                title="Tidak ada kategori tools"
                                subtitle="Mulailah dengan membuat kategori tools baru"
                            />
                        ) : view === 'card' ? (
                            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {categories.map((category) => (
                                    <CategoryCard
                                        setEditingCategory={setEditingCategory}
                                        key={category.id}
                                        category={category}
                                        auth={props.auth}
                                    />
                                ))}

                                {hasAnyPermissions(props.auth.permissions, ['category.create']) && (
                                    <button
                                        type="button"
                                        className="mb-2 text-left"
                                        onClick={() => setCreateOpen(true)}
                                    >
                                        <Card className="flex h-full min-h-[150px] items-center justify-center border-dashed text-muted-foreground hover:bg-muted/40">
                                            <p className="text-sm">+ kategori tools Baru</p>
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
                                                kategori tools
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                onClick={() => onSortable('tools_count')}
                                                variant="ghost"
                                                className="group inline-flex"
                                            >
                                                Total tools
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                onClick={() => onSortable('tool_attributes_count')}

                                                variant="ghost"
                                                className="group inline-flex"
                                            >
                                                Total Attribute
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
                                                Dibuat Pada
                                                <span className="ml-2 flex-none rounded text-muted-foreground">
                                                    <IconArrowsDownUp className="size-4" />
                                                </span>
                                            </Button>
                                        </TableHead>
                                        {hasAnyPermissions(props.auth.permissions, [
                                            'category.update',
                                            'category.delete',
                                        ]) && <TableHead>Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-center">
                                    {categories.map((category, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1 + (meta.current_page - 1) * meta.per_page}</TableCell>
                                            <TableCell>{category.name}</TableCell>
                                            <TableCell>{category.tools_count}</TableCell>
                                            <TableCell>{category.attributes_count}</TableCell>

                                            <TableCell>{formatDateIndo(category.created_at)}</TableCell>

                                            {hasAnyPermissions(props.auth.permissions, [
                                                'category',
                                                'category.update',
                                                'category.delete',
                                            ]) && (
                                                <TableCell>
                                                    <div className="flex items-center gap-x-1">
                                                        <Button variant="purple" size="sm" asChild>
                                                            <Link href={route('category.show', [category.slug])}>
                                                                <IconLocationSearch size="4" />
                                                                Lihat detail kategori
                                                            </Link>
                                                        </Button>
                                                        {hasAnyPermissions(props.auth.permissions, [
                                                            'category.update',
                                                        ]) && (
                                                            <Button
                                                                onClick={() => setEditingCategory(category)}
                                                                variant="blue"
                                                                size="sm"
                                                            >
                                                                <IconPencil size="4" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {hasAnyPermissions(props.auth.permissions, [
                                                            'category.delete',
                                                        ]) && (
                                                            <AlertAction
                                                                trigger={
                                                                    <Button variant="red" size="sm">
                                                                        <IconTrash className="size-4" />
                                                                        Delete
                                                                    </Button>
                                                                }
                                                                action={() =>
                                                                    deleteAction(route('category.destroy', [category]))
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
                            {meta.total} kategori tools
                        </p>
                        <div className="overflow-x-auto">
                            {meta.has_pages && <PaginationTable meta={meta} links={links} />}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <CreateCategoryModal
                users={props.users}
                action={props.page_settings.action}
                method={props.page_settings.method}
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
            <EditCategoryModal
                open={editingCategory !== null}
                onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}
                category={editingCategory}
                method="PUT"
            />
        </>
    );
}

Index.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

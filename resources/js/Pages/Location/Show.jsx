import AlertAction from '@/Components/AlertAction';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import AppLayout from '@/Layouts/AppLayout';
import hasAnyPermissions, { deleteAction } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconDotsVertical,
    IconEye,
    IconLocation,
    IconPencil,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import SubLocationModal from './SubLocationModal';
import HeaderTitle from '@/Components/HeaderTitle';

export default function Show({ auth, location, users }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState(null); // null = mode tambah

    const openCreate = () => {
        setEditingSub(null);
        setModalOpen(true);
    };

    const openEdit = (sub) => {
        setEditingSub(sub);
        setModalOpen(true);
    };

    return (
        <>
            <div className="flex w-full flex-col pb-32">
                {/* Header info lokasi */}
                <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                    <HeaderTitle
                        title={location.name}
                        subtitle={`Detail lokasi ${location.name}`}
                        icon={IconLocation}
                    />

                    <Button asChild variant="blue" size="xl" className="w-full lg:w-auto">
                        <Link href={route('location.index')}>
                            <IconArrowLeft className="size-4" /> Kembali
                        </Link>
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <h1 className="text-2xl font-bold">{location.name}</h1>
                        <p className="mb-3 text-sm text-muted-foreground">Detail lokasi {location.name}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {location.children_count} sub lokasi
                            </span>
                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {location.tools_parent_count} total tools (Lokasi {location.name})
                            </span>
                            <span className="rounded-full border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600">
                                {location.total_tools} total tools (semua sub lokasi)
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Sub-Lokasi */}
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground">Sub-Lokasi</h2>
                    {hasAnyPermissions(auth.permissions, ['location.create']) && (
                        <Button variant="blue" size="sm" onClick={openCreate}>
                            <IconPlus className="size-4" />
                            Tambah Sub-Lokasi
                        </Button>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Card "Semua sub lokasi" - agregat, bukan record asli, jadi gak ada dropdown */}

                    <Card>
                        <CardContent className="pt-6">
                            <p className="font-bold">Lokasi ini ({location.name})</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {location.tools_parent_count} tools . {location.tools_parent_stock} stok
                            </p>
                        </CardContent>
                    </Card>

                    {location.children.map((sub) => (
                        <Card key={sub.id} className="relative">
                            {hasAnyPermissions(auth.permissions, ['location.update', 'location.delete']) && (
                                <div className="absolute right-3 top-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-7">
                                                <IconDotsVertical className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {hasAnyPermissions(auth.permissions, ['location.index']) && (
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={route('location.sub-locations.show', [
                                                            location.slug,
                                                            sub.slug,
                                                        ])}
                                                    >
                                                        <IconEye className="mr-2 size-4" />
                                                        Lihat Detail
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            {hasAnyPermissions(auth.permissions, ['location.update']) && (
                                                <DropdownMenuItem onSelect={() => openEdit(sub)}>
                                                    <IconPencil className="mr-2 size-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {hasAnyPermissions(auth.permissions, ['location.delete']) && (
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    <AlertAction
                                                        trigger={
                                                            <div className="flex w-full items-center">
                                                                <IconTrash className="mr-2 size-4" />
                                                                Hapus
                                                            </div>
                                                        }
                                                        action={() =>
                                                            deleteAction(
                                                                route('location.sub-locations.destroy', [
                                                                    location.slug,
                                                                    sub.slug,
                                                                ]),
                                                            )
                                                        }
                                                    />
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            <CardContent className="pt-6">
                                <p className="font-bold">{sub.name}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {sub.tools_count} tools . {sub.total_stock} stok
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    {hasAnyPermissions(auth.permissions, ['location.create']) && (
                        <button type="button" className="text-left" onClick={openCreate}>
                            <Card className="flex h-full min-h-[110px] items-center justify-center border-dashed text-muted-foreground hover:bg-muted/40">
                                <p className="text-sm">+ Sub Lokasi Baru</p>
                            </Card>
                        </button>
                    )}
                </div>
            </div>

            <SubLocationModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                subLocation={editingSub}
                users={users}
                action={
                    editingSub
                        ? route('location.sub-locations.update', [location.slug, editingSub.slug])
                        : route('location.sub-locations.store', [location.slug])
                }
                method={editingSub ? 'put' : 'post'}
            />
        </>
    );
}

Show.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

import AlertAction from '@/Components/AlertAction';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import hasAnyPermissions, { deleteAction } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconDotsVertical, IconEye, IconPencil, IconTrash } from '@tabler/icons-react';

export default function LocationCard({ location, auth, setEditingLocation }) {
    const initial = location.name?.charAt(0)?.toUpperCase() ?? '?';
    const isParent = location.children_count > 0;

    return (
        <Card className="relative mb-2">
            {hasAnyPermissions(auth.permissions, ['location.index', 'location.update', 'location.delete']) && (
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
                                    <Link href={route('location.show', [location.slug])}>
                                        <IconEye className="mr-2 size-4" />
                                        Lihat Detail
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {hasAnyPermissions(auth.permissions, ['location.update']) && (
                                <DropdownMenuItem asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex w-full items-center justify-start"
                                        as="button"
                                        onClick={() => setEditingLocation(location)}
                                    >
                                        <IconPencil className="mr-2 size-4" />
                                        Edit
                                    </Button>
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
                                        action={() => deleteAction(route('location.destroy', [location]))}
                                    />
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <CardContent className="pt-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg border-2 border-blue-500 text-lg font-bold text-blue-500">
                    {initial}
                </div>

                <Link href={route('location.show', [location.slug])} className="hover:underline">
                    <p className="text-lg font-bold">{location.name}</p>
                </Link>

                {isParent && (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        {location.children_count} sub lokasi
                    </span>
                )}

                <div className="mt-3 flex gap-6">
                    <div>
                        <p className="text-base font-bold">{location.tools_count}</p>
                        <p className="text-xs text-muted-foreground">Tool</p>
                    </div>
                    <div>
                        <p className="text-base font-bold">{location.total_stock}</p>
                        <p className="text-xs text-muted-foreground">Total Stok</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

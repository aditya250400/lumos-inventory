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

export default function CategoryCard({ category, auth, setEditingCategory }) {
    const initial = category.name?.charAt(0)?.toUpperCase() ?? '?';

    return (
        <Card className="relative mb-2">
            {hasAnyPermissions(auth.permissions, ['category.index', 'category.update', 'category.delete']) && (
                <div className="absolute right-3 top-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                                <IconDotsVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {hasAnyPermissions(auth.permissions, ['category.index']) && (
                                <DropdownMenuItem asChild>
                                    <Link href={route('category.show', [category.slug])}>
                                        <IconEye className="mr-2 size-4" />
                                        Lihat Detail
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {hasAnyPermissions(auth.permissions, ['category.update']) && (
                                <DropdownMenuItem asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex w-full items-center justify-start"
                                        as="button"
                                        onClick={() => setEditingCategory(category)}
                                    >
                                        <IconPencil className="mr-2 size-4" />
                                        Edit
                                    </Button>
                                </DropdownMenuItem>
                            )}
                            {hasAnyPermissions(auth.permissions, ['category.delete']) && (
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
                                        action={() => deleteAction(route('category.destroy', [category]))}
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

                <Link href={route('category.show', [category.slug])} className="hover:underline">
                    <p className="text-lg font-bold">{category.name}</p>
                </Link>

                <div className="mt-3 flex gap-6">
                    <div>
                        <p className="text-base font-bold">{category.tools_count}</p>
                        <p className="text-xs text-muted-foreground">Tools</p>
                    </div>
                    <div>
                        <p className="text-base font-bold">{category.toolAttributes_count}</p>
                        <p className="text-xs text-muted-foreground">Attributes</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

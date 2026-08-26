import AlertAction from '@/Components/AlertAction';
import ToolStatusBadge from '@/Components/ToolStatusBadge';
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
import { IconDotsVertical, IconEye, IconPencil, IconPhoto, IconTrash } from '@tabler/icons-react';

export default function ToolCard({ tool, auth, onEditTrigger }) {
    return (
        <Card className="overflow-hidden py-0">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {tool.primary_image ? (
                    <img
                        src={tool.primary_image}
                        alt={tool.name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <IconPhoto className="size-12 text-muted-foreground/30" />
                    </div>
                )}

                {/* Status */}
                <div className="absolute left-2 top-2 z-10">
                    <ToolStatusBadge status={tool.status} />
                </div>

                {/* Action */}
                {hasAnyPermissions(auth.permissions, ['tools.index', 'tools.update', 'tools.delete']) && (
                    <div className="absolute right-2 top-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="size-7 shadow">
                                    <IconDotsVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {hasAnyPermissions(auth.permissions, ['tools.index']) && (
                                    <DropdownMenuItem asChild>
                                        <Link href={route('tools.show', [tool.tool_code])}>
                                            <IconEye className="mr-2 size-4" />
                                            Lihat Detail
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {hasAnyPermissions(auth.permissions, ['tools.update']) && (
                                    <DropdownMenuItem onSelect={() => onEditTrigger(tool)}>
                                        <IconPencil className="mr-2 size-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}

                                {hasAnyPermissions(auth.permissions, ['tools.delete']) && (
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
                                            action={() => deleteAction(route('tools.destroy', [tool.tool_code]))}
                                        />
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Content */}
            <CardContent className="px-4 pb-4 pt-3">
                <Link href={route('tools.show', [tool.tool_code])} className="block truncate font-semibold">
                    {tool.name}
                </Link>

                <p className="mb-2 text-xs text-muted-foreground">{tool.tool_code}</p>

                <div className="flex items-center justify-between gap-2 text-sm">
                    <Link href={route('category.show', [tool.category])} className="truncate text-muted-foreground">
                        {tool.category?.name ?? '-'}
                    </Link>

                    <span className="shrink-0 font-medium">Stok {tool.stock}</span>
                </div>
            </CardContent>
        </Card>
    );
}

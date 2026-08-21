import AlertAction from '@/Components/AlertAction';
import EmptyState from '@/Components/EmptyState';
import ToolStatusBadge from '@/Components/ToolStatusBadge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import hasAnyPermissions, { deleteAction, formatDateIndo } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { IconArrowsDownUp, IconTrash } from '@tabler/icons-react';

export default function ToolsTable({ tools, meta, auth, onSortable, dynamicColumns = [], showCategory = false }) {
    return (
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>

                    <TableHead>
                        <SortableHead label="Kode" field="tool_code" onSortable={onSortable} />
                    </TableHead>

                    <TableHead>
                        <SortableHead label="Nama" field="name" onSortable={onSortable} />
                    </TableHead>

                    {/* Optional: kategori */}
                    {showCategory && <TableHead>Kategori</TableHead>}

                    <TableHead>Lokasi</TableHead>

                    <TableHead>
                        <SortableHead label="Status" field="status" onSortable={onSortable} />
                    </TableHead>

                    <TableHead>
                        <SortableHead label="Jenis Tool" field="inventory_type" onSortable={onSortable} />
                    </TableHead>

                    <TableHead>Dipakai Oleh</TableHead>

                    <TableHead>
                        <SortableHead label="Stok" field="stock" onSortable={onSortable} />
                    </TableHead>

                    {/* Dynamic attributes */}
                    {dynamicColumns.map((column) => (
                        <TableHead key={column} className="bg-blue-50 text-blue-700">
                            {column}
                        </TableHead>
                    ))}

                    <TableHead>Dibuat Pada</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {tools.map((tool, index) => (
                    <TableRow key={tool.id}>
                        <TableCell>{index + 1 + (meta.current_page - 1) * meta.per_page}</TableCell>

                        <TableCell>{tool.tool_code}</TableCell>

                        <TableCell>{tool.name}</TableCell>

                        {/* Optional: kategori */}
                        {showCategory && <TableCell>{tool.category?.name ?? '-'}</TableCell>}

                        <TableCell>
                            {tool.location?.name ? (
                                <>
                                    {tool.location.name}

                                    {tool.location.parent?.name && (
                                        <span className="font-bold"> ({tool.location.parent.name})</span>
                                    )}
                                </>
                            ) : (
                                '-'
                            )}
                        </TableCell>

                        <TableCell>
                            <ToolStatusBadge status={tool.status} />
                        </TableCell>

                        <TableCell>{tool.inventory_type}</TableCell>

                        <TableCell>{tool.used_by?.name ?? '-'}</TableCell>

                        <TableCell>{tool.stock}</TableCell>

                        {/* Dynamic attributes */}
                        {dynamicColumns.map((column) => (
                            <TableCell key={column} className="bg-blue-50/50">
                                {tool.attributes?.[column] ?? '-'}
                            </TableCell>
                        ))}

                        <TableCell>{formatDateIndo(tool.created_at)}</TableCell>

                        <TableCell>
                            <div className="flex items-center justify-center gap-x-1">
                                <Button variant="purple" size="sm" asChild>
                                    <Link href={route('tools.show', [tool.id])}>Detail</Link>
                                </Button>

                                {hasAnyPermissions(auth.permissions, ['tools.delete']) && (
                                    <AlertAction
                                        trigger={
                                            <Button variant="red" size="sm">
                                                <IconTrash className="size-4" />
                                            </Button>
                                        }
                                        action={() => deleteAction(route('tools.destroy', [tool.id]))}
                                    />
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function SortableHead({ label, field, onSortable }) {
    return (
        <Button variant="ghost" onClick={() => onSortable?.(field)}>
            {label}

            <span className="ml-2 flex-none rounded text-muted-foreground">
                <IconArrowsDownUp className="size-4" />
            </span>
        </Button>
    );
}

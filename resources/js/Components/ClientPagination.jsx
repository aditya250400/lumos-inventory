import { Button } from '@/Components/ui/button';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

export function useClientPagination(items = [], perPage = 5) {
    const [page, setPage] = useState(1);

    const total = items.length;

    const totalPages = Math.max(1, Math.ceil(total / perPage));

    const pagedItems = useMemo(() => {
        const start = (page - 1) * perPage;

        return items.slice(start, start + perPage);
    }, [items, page, perPage]);

    // Kalau jumlah data berubah dan halaman aktif sudah tidak valid
    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    // Reset ke halaman 1 kalau perPage berubah
    useEffect(() => {
        setPage(1);
    }, [perPage]);

    return {
        page,
        setPage,
        perPage,
        total,
        totalPages,
        pagedItems,
        from: total === 0 ? 0 : (page - 1) * perPage + 1,
        to: Math.min(page * perPage, total),
    };
}

export default function ClientPagination({ page, setPage, totalPages, total, from, to, perPage = 5, label = 'data' }) {
    if (total === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-y-2 border-t px-4 py-3 lg:flex-row">
            <p className="text-sm text-muted-foreground">
                Menampilkan {from}-{to} dari {total} {label}
            </p>

            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage((current) => current - 1)}
                    >
                        <IconChevronLeft className="size-4" />
                    </Button>

                    <span className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white">{page}</span>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        <IconChevronRight className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

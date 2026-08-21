import { Badge } from '@/Components/ui/badge';

export const TOOL_STATUS_STYLES = {
    Tersedia: {
        label: 'Tersedia',
        className: 'border-green-200 bg-green-100 text-green-700 hover:bg-green-100',
    },

    'Tidak Tersedia': {
        label: 'Tidak Tersedia',
        className: 'border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },

    Rusak: {
        label: 'Rusak',
        className: 'border-red-200 bg-red-100 text-red-700 hover:bg-red-100',
    },

    Dipinjam: {
        label: 'Dipinjam',
        className: 'border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100',
    },

    Hilang: {
        label: 'Hilang',
        className: 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100',
    },
};

export function getToolStatusStyle(status) {
    return (
        TOOL_STATUS_STYLES[status] ?? {
            label: status ?? 'Tidak diketahui',
            className: 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100',
        }
    );
}

export default function ToolStatusBadge({ status }) {
    const statusStyle = getToolStatusStyle(status);

    return (
        <Badge variant="outline" className={statusStyle.className}>
            {statusStyle.label}
        </Badge>
    );
}

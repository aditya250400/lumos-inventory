import { Button } from '@/Components/ui/button';
import { IconLayoutGrid, IconTable } from '@tabler/icons-react';

export default function ViewSwitcher({ value, onChange }) {
    return (
        <div className="flex shrink-0 rounded-lg border p-0.5">
            <Button
                type="button"
                size="sm"
                variant={value === 'card' ? 'blue' : 'ghost'}
                className="w-full gap-1.5 lg:w-fit"
                onClick={() => onChange('card')}
            >
                <IconLayoutGrid className="size-4" />
                Card
            </Button>

            <Button
                type="button"
                size="sm"
                variant={value === 'table' ? 'blue' : 'ghost'}
                className="w-full gap-1.5 lg:w-fit"
                onClick={() => onChange('table')}
            >
                <IconTable className="size-4" />
                Tabel
            </Button>
        </div>
    );
}

import HeaderTitle from '@/Components/HeaderTitle';
import AppLayout from '@/Layouts/AppLayout';
import { IconLayout2 } from '@tabler/icons-react';

export default function Dashboard(props) {
    return (
        <div className="flex w-full flex-col pb-32">
            <div className="mb-8 flex flex-col items-start justify-between gap-y-4 lg:flex-row lg:items-center">
                <HeaderTitle
                    title={'Dashboard'}
                    subtitle={'Menampilkan semua statistik pada platform'}
                    icon={IconLayout2}
                />
            </div>
            <div className="mb-8 flex flex-col">
                <h2 className="text-xl font-medium leading-relaxed text-foreground">Hi, {props.auth.user.name}</h2>
                <p className="text-sm text-muted-foreground"> Selamat datang di Lumos Inventory System</p>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} title={page.props.page_settings.title} />;

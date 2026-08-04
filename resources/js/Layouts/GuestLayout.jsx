import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';

export default function GuestLayout({ children, title }) {
    return (
        <>
            <Head title={title} />
            <Toaster position="top-center" richColors />
            {children}
        </>
    );
}

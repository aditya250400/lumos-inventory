import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { router } from '@inertiajs/react';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const formatDateIndo = (dateString) => {
    return format(parseISO(dateString), 'eeee, dd MMM yyy', { locale: id });
};

export default function hasAnyPermissions(allPermissions, permissions) {
    let hasPermission = false;

    permissions.forEach(function (item) {
        if (allPermissions[item]) hasPermission = true;
    });

    return hasPermission;
}

export function flashMessage(params) {
    return params.props.flash_message;
}

export const deleteAction = (url, { closeModal, ...options } = {}) => {
    const defaultOptions = {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (success) => {
            const flash = flashMessage(success);
            if (flash) {
                toast[flash.type](flash.message);
            }

            if (closeModal && typeof closeModal === 'function') {
                closeModal();
            }
        },
        ...options,
    };

    router.delete(url, defaultOptions);
};

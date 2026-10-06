import NavLink from '@/Components/NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import hasAnyPermissions from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    IconLayout2,
    IconLogout2,
    IconUser,
    IconUsers,
    IconFileText,
    IconLocation,
    IconCategory2,
    IconTools,
    IconPrinter,
    IconPencilCheck,
    IconShieldCode,
    IconTagPlus,
} from '@tabler/icons-react';

export default function SidebarResponsive({ auth, url }) {
    return (
        <nav className="mt-4 flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col">
                {/* Profil user */}
                <li className="-mx-6">
                    <Link
                        className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-blue-800"
                        href="#"
                    >
                        <Avatar>
                            <AvatarImage src={auth.user.avatar} />
                            <AvatarFallback>{auth.user.name.substring(0, 1)}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col text-left">
                            <span className="truncate font-bold">{auth.user.name}</span>
                            <span className="truncate">{auth.user.role_name}</span>
                        </div>
                    </Link>
                </li>

                {/* Dashboard */}
                <NavLink
                    url={route('dashboard')}
                    active={url.startsWith('/dashboard')}
                    title="Dashboard"
                    icon={IconLayout2}
                />

                {/* Grup: Aktivitas */}
                <div className="px-3 py-2 text-base font-medium text-white">Aktivitas</div>

                {hasAnyPermissions(auth.permissions, ['stock-opnames.index']) && (
                    <NavLink
                        url={route('stock-opnames.index')}
                        active={url.startsWith('/stock-opnames')}
                        title="Stock Opname"
                        icon={IconPencilCheck}
                    />
                )}

                {hasAnyPermissions(auth.permissions, ['loans.index']) && (
                    <NavLink url="#" title="Peminjaman" icon={IconTagPlus} />
                )}

                {/* Belum ada permission laporan di PermissionSeeder */}
                <NavLink
                    url={route('reports.index')}
                    title="Laporan"
                    icon={IconFileText}
                    active={url.startsWith('/reports')}
                />

                {/* Belum ada permission cetak dokumen di PermissionSeeder */}
                <NavLink url="#" title="Cetak Dokumen" icon={IconPrinter} />

                {/* Grup: Data Master */}
                {hasAnyPermissions(auth.permissions, [
                    'location.index',
                    'tools.index',
                    'category.index',
                    'roles.index',
                    'users.index',
                ]) && <div className="px-3 py-2 text-base font-medium text-white">Data Master</div>}

                {hasAnyPermissions(auth.permissions, ['location.index']) && (
                    <NavLink
                        url={route('location.index')}
                        active={url.startsWith('/locations')}
                        title="Lokasi"
                        icon={IconLocation}
                    />
                )}

                {hasAnyPermissions(auth.permissions, ['category.index']) && (
                    <NavLink
                        url={route('category.index')}
                        active={url.startsWith('/categories')}
                        title="Kategori Tools"
                        icon={IconCategory2}
                    />
                )}

                {hasAnyPermissions(auth.permissions, ['tools.index']) && (
                    <NavLink
                        url={route('tools.index')}
                        active={url.startsWith('/tools')}
                        title="Tools"
                        icon={IconTools}
                    />
                )}

                {hasAnyPermissions(auth.permissions, ['roles.index']) && (
                    <NavLink
                        url={route('roles.index')}
                        active={url.startsWith('/roles')}
                        title="Roles"
                        icon={IconShieldCode}
                    />
                )}

                {hasAnyPermissions(auth.permissions, ['users.index']) && (
                    <NavLink
                        url={route('users.index')}
                        active={url.startsWith('/users')}
                        title="Pengguna"
                        icon={IconUsers}
                    />
                )}

                {/* Lainnya */}
                <div className="px-3 py-1 text-base font-medium text-white">Lainnya</div>

                {/* Profile tidak membutuhkan permission khusus */}
                <NavLink
                    url={route('profile.edit', [auth.user.id])}
                    active={url.startsWith('/profile')}
                    title="Akun"
                    icon={IconUser}
                />

                {/* Logout tidak membutuhkan permission */}
                <NavLink
                    url={route('logout')}
                    method="post"
                    as="button"
                    active={url.startsWith('/logout')}
                    title="Logout"
                    className="w-full"
                    icon={IconLogout2}
                />
            </ul>
        </nav>
    );
}

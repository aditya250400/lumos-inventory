import NavLink from '@/Components/NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
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

export default function Sidebar({ auth, url }) {
    return (
        <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col">
                {/* Profil user yang sedang login */}
                <li className="-mx-6">
                    <Link
                        className="items-cemter flex gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-slate-800"
                        href={'#'}
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

                <NavLink
                    url={route('dashboard')}
                    active={url.startsWith('/dashboard')}
                    title="Dashboard"
                    icon={IconLayout2}
                />

                {/* Grup: Aktivitas */}
                <div className="px-3 py-2 text-base font-medium text-white">Aktivitas</div>

                <NavLink url="#" title="Stock Opname" icon={IconPencilCheck} />
                <NavLink url="#" title="Peminjaman" icon={IconTagPlus} />

                <NavLink url="#" title="Laporan" icon={IconFileText} />
                <NavLink url="#" title="Cetak Dokumen" icon={IconPrinter} />

                {/* Grup: Data Master */}
                <div className="px-3 py-2 text-base font-medium text-white">Data Master</div>

                <NavLink
                    url={route('location.index')}
                    active={url.startsWith('/locations')}
                    title="Lokasi"
                    icon={IconLocation}
                />
                <NavLink
                    url={route('category.index')}
                    active={url.startsWith('/categories')}
                    title="Kategori Tools"
                    icon={IconCategory2}
                />
                <NavLink url={route('tools.index')} active={url.startsWith('/tools')} title="Tools" icon={IconTools} />
                <NavLink
                    url={route('roles.index')}
                    active={url.startsWith('/roles')}
                    title="Roles"
                    icon={IconShieldCode}
                />
                <NavLink url={'#'} active={url.startsWith('/users')} title="Pengguna" icon={IconUsers} />

                {/* Lainnya */}
                <div className="px-3 py-1 text-base font-medium text-white">Lainnya</div>
                <NavLink url={'#'} active={url.startsWith('/users')} title="Akun" icon={IconUser} />

                <NavLink
                    url={route('logout')}
                    method="post"
                    as="button"
                    active={url.startsWith('/logout')}
                    title={'Logout'}
                    className="w-full"
                    icon={IconLogout2}
                />
            </ul>
        </nav>
    );
}

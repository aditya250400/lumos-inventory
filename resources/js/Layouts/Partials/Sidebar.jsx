import NavLink from '@/Components/NavLink';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Link } from '@inertiajs/react';
import {
    IconLayout2,
    IconLogout2,
    IconFolder,
    IconFolders,
    IconSettings,
    IconUser,
    IconUsers,
    IconUsersGroup,
    IconFileText,
    IconListDetails,
    IconClipboardList,
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

                <NavLink url="#" active="#" title="Dashboard" icon={IconLayout2} />

                {/* Grup: Data Master */}
                <div className="px-3 py-2 text-base font-medium text-white">Data Master</div>

                <NavLink url="#" title="Master Resource 1" icon={IconFolder} />

                <NavLink url="#" title="Master Resource 2" icon={IconFolders} />

                <NavLink url="#" title="Pengaturan" icon={IconSettings} />

                {/* Grup: Manajemen Pengguna */}
                <div className="px-3 py-2 text-base font-medium text-white">Manajemen Pengguna</div>

                <NavLink url="#" title="Pengguna Tipe A" icon={IconUsers} />

                <NavLink url="#" title="Pengguna Tipe B" icon={IconUsersGroup} />

                <NavLink url="#" title="Pengguna Tipe C" icon={IconUser} />

                {/* Grup: Aktivitas */}
                <div className="px-3 py-2 text-base font-medium text-white">Aktivitas</div>

                <NavLink url="#" title="Aktivitas 1" icon={IconClipboardList} />

                <NavLink url="#" title="Laporan" icon={IconFileText} />

                {/* ROLE 2 */}
                <NavLink url="#" title="Dashboard" icon={IconLayout2} />

                <div className="px-3 py-1 text-base font-medium text-white">Grup Menu 1</div>

                <NavLink url="#" title="Resource 1" icon={IconListDetails} />

                <NavLink url="#" title="Resource 2" icon={IconFolder} />

                {/* ROLE 3 */}
                <NavLink url="#" title="Dashboard" icon={IconLayout2} />

                <div className="px-3 py-1 text-base font-medium text-white">Grup Menu 1</div>

                <NavLink url="#" title="Resource 1" icon={IconUsers} />

                {/* Lainnya */}
                <div className="px-3 py-1 text-base font-medium text-white">Lainnya</div>

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

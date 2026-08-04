import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { IconEye } from '@tabler/icons-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export default function Permission({ role, permissions }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="purple" size="sm">
                    <IconEye className="size-4 text-white" /> Lihat Hak Akses
                </Button>
            </SheetTrigger>
            <SheetContent side="top" className="scroll-bar max-h-screen overflow-y-scroll">
                <SheetHeader>
                    <SheetTitle>Hak Akses Peran {role}</SheetTitle>
                    <SheetDescription>
                        Menampilkan daftar hak akses yang dimiliki oleh peran{' '}
                        <span className="font-medium">{role}</span>. Setiap hak akses menentukan fitur yang dapat
                        digunakan oleh pengguna dengan peran tersebut.
                    </SheetDescription>
                </SheetHeader>
                <Table className="w-full border">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border">No</TableHead>
                            <TableHead className="border">Nama Hak Akses</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.map((permission, index) => (
                            <TableRow key={index}>
                                <TableCell className="border">{index + 1}</TableCell>
                                <TableCell className="border">{permission.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </SheetContent>
        </Sheet>
    );
}

import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { buttonVariants } from './ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from './ui/pagination';

const PaginationLink = ({ className, isActive, size = 'icon', href, ...props }) => {
    if (!href) {
        return (
            <span className={cn('cursor-not-allowed', className)} {...props}>
                ...
            </span>
        );
    }

    return (
        <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                className,
            )}
            href={href}
            {...props}
        />
    );
};

export default function PaginationTable({ meta, links }) {
    return (
        <Pagination>
            <PaginationContent className="flex flex-wrap justify-center lg:justify-end">
                <PaginationItem>
                    {links.prev ? (
                        <PaginationPrevious className={cn('mb-1')} href={links.prev} />
                    ) : (
                        <span className="mb-1 cursor-not-allowed">Previous</span>
                    )}
                </PaginationItem>

                {meta.links.slice(1, -1).map((link, index) => (
                    <PaginationItem key={index} className="lb:mb-0 mx-1 mb-1">
                        <PaginationLink href={link.url} isActive={link.active}>
                            {link.label}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                <PaginationItem>
                    {links.next ? (
                        <PaginationNext className={cn('mb-1')} href={links.next} />
                    ) : (
                        <span className="mb-1 cursor-not-allowed">Next</span>
                    )}
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

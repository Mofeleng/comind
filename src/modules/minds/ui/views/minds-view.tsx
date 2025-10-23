"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useMindsFilter } from "../../hooks/use-minds-filter";
import { DataPagination } from "../components/data-pagination";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";

export const MindsView = () => {
    const [ filters, setFilters ] = useMindsFilter();
    const router = useRouter();

    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.minds.getMany.queryOptions({
        ...filters
    }));

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable
                data={data.items}
                columns={columns}
                onRowClick={(row) => router.push(`/minds/${row.id}`)}/>
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            { data.items.length === 0 && (
                <EmptyState 
                    title="No minds available"
                    description="Create a mind to join your meetings, each mind will follow your instructions and interact with you or members of your sessions."
                />
            )}
        </div>
    )
}

export const MindsViewLoading = () => {
    return <LoadingState title="Loading your collaborative minds" description="This may take a few seconds"/>
}

export const MindsViewError = () => {
    return <ErrorState title="Failed to load Collaborative minds" description="Please try again later"/>

}
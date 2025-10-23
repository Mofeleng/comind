"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useSessionsFilter } from "../../hooks/use-sessions-filter";
import { DataPagination } from "@/components/data-pagination";
import { useRouter } from "next/navigation";

export const SessionsView = () => {
    const trcp = useTRPC();
    const [ filters, setFilters ] = useSessionsFilter();
    const router = useRouter();

    const { data } = useSuspenseQuery(trcp.sessions.getMany.queryOptions({
        ...filters
    }));

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex-col gap-y-4">
            <DataTable 
                data={data.items}
                columns={columns}
                onRowClick={(row) => router.push(`/sessions/${row.id}`)}
            />
            <DataPagination 
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />
            { data.items.length === 0 && (
                <EmptyState 
                    title="No sessions found"
                    description="Create a session to collaborate with minds, and other users"
                />
            )}
        </div>
    )
}


export const SessionsViewLoading = () => {
    return <LoadingState title="Loading your sessions" description="This may take a few seconds"/>
}

export const SessionsViewError = () => {
    return <ErrorState title="Failed to load your sessions" description="Please try again later"/>

}
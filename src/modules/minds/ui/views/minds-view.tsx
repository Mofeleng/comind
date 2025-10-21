"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";


export const MindsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.minds.getMany.queryOptions());

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable data={data} columns={columns}/>
            { data.length === 0 && (
                <EmptyState 
                    title="Create your first mind"
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
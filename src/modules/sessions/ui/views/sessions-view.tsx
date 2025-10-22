"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const SessionsView = () => {
    const trcp = useTRPC();
    const { data } = useQuery(trcp.sessions.getMany.queryOptions({}));

    return (
        <div className="overflow-hidden">
            { JSON.stringify(data, null, 2)}
        </div>
    )
}


export const SessionsViewLoading = () => {
    return <LoadingState title="Loading your sessions" description="This may take a few seconds"/>
}

export const SessionsViewError = () => {
    return <ErrorState title="Failed to load your sessions" description="Please try again later"/>

}
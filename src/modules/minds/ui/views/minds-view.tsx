"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const MindsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.minds.getMany.queryOptions());

    return (
        <div>{ JSON.stringify(data, null, 2) }</div>
    )
}

export const MindsViewLoading = () => {
    return <LoadingState title="Loading your collaborative minds" description="This may take a few seconds"/>
}

export const MindsViewError = () => {
    return <ErrorState title="Failed to load Collaborative minds" description="Please try again later"/>

}
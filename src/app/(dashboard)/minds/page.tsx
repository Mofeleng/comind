import { MindsView, MindsViewError, MindsViewLoading } from "@/modules/minds/ui/views/minds-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const Page = async () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.minds.getMany.queryOptions());

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MindsViewLoading />}>
                <ErrorBoundary fallback={<MindsViewError />}>
                    <MindsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
 
export default Page;
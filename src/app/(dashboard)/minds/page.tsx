import { MindsView, MindsViewError, MindsViewLoading } from "@/modules/minds/ui/views/minds-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { MindsListHeader } from "@/modules/minds/ui/components/list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session) {
    redirect("/auth/sign-in")
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.minds.getMany.queryOptions());

    return (
        <>
            <MindsListHeader/>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<MindsViewLoading />}>
                    <ErrorBoundary fallback={<MindsViewError />}>
                        <MindsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}
 
export default Page;
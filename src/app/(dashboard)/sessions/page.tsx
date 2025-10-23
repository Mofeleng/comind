import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/sessions/params";
import { SessionsListHeader } from "@/modules/sessions/ui/components/list-header";
import { SessionsView, SessionsViewError, SessionsViewLoading } from "@/modules/sessions/ui/views/sessions-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";


interface Props {
    searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }:Props) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/sign-in");
    }

    const filters = await loadSearchParams(searchParams);

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.sessions.getMany.queryOptions({
        ...filters
    }));

    return ( 
        <>
            <SessionsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<SessionsViewLoading />}>
                    <ErrorBoundary fallback={<SessionsViewError />}>
                        <SessionsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
     );
}
 
export default Page;

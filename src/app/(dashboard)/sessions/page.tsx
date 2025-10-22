import { auth } from "@/lib/auth";
import { SessionsView, SessionsViewError, SessionsViewLoading } from "@/modules/sessions/ui/views/sessions-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/sign-in");
    }
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.sessions.getMany.queryOptions({}));

    return ( 
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<SessionsViewLoading />}>
                <ErrorBoundary fallback={<SessionsViewError />}>
                    <SessionsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
     );
}
 
export default Page;

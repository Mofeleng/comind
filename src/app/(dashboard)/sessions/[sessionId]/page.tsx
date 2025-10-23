import { auth } from "@/lib/auth";
import { SessionView, SessionViewError, SessionViewLoading } from "@/modules/sessions/ui/views/session-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    params: Promise<{ sessionId: string }>;
}

const Page = async ({ params }:Props) => {
    const { sessionId } = await params;

    const session = await auth.api.getSession({
            headers: await headers()
    });

    if (!session) {
        redirect("/auth/sign-in");
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.sessions.getOne.queryOptions({ id: sessionId }));


    return ( 
        <>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<SessionViewLoading />}>
                    <ErrorBoundary fallback={<SessionViewError />}>
                        <SessionView sessionId={sessionId} />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
     );
}
 
export default Page;
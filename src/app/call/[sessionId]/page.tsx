import { auth } from "@/lib/auth";
import { CallView } from "@/modules/call/ui/views/call-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{sessionId: string}>;
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
    void queryClient.prefetchQuery(trpc.sessions.getOne.queryOptions({
        id: sessionId
    }));
    return ( 
        <>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <CallView sessionId={sessionId}/>
            </HydrationBoundary>
        </>
     );
}
 
export default Page;
import { MindView, MindViewError, MindViewLoading } from "@/modules/minds/ui/views/mind-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
    params: Promise<{ mindId: string}>;
}

const Page = async ({ params}:Props) => {
    const { mindId } = await params;
    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(trpc.minds.getOne.queryOptions({ id: mindId }));

    return ( 
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MindViewLoading />}>
                <ErrorBoundary fallback={<MindViewError />}>
                    <MindView mindId={mindId}/>
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
     );
}
 
export default Page;
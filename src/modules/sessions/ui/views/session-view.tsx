"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { SessionViewHeader } from "../components/session-view-header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "../../hooks/use-confirm";
import { UpdateSessionDialog } from "../components/update-session-dialog";
import { useState } from "react";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { CompletedState } from "../components/completed-state";

interface Props {
    sessionId: string;
}

export const SessionView = ({ sessionId }: Props) => {
    const trcp = useTRPC();
    const { data } = useSuspenseQuery(trcp.sessions.getOne.queryOptions({ id: sessionId }))
    const queryClient = useQueryClient();
    const router = useRouter();
    const [ RemoveConfirmation, confirmRemove ] = useConfirm("Are you sure?", "This action cannot be undone");
    const [ updateSessionDialogOpen, setUpdateSessionDialogOpen ] = useState(false);

    const removeSession = useMutation(trcp.sessions.remove.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trcp.sessions.getMany.queryOptions({}));
            await queryClient.invalidateQueries(trcp.premium.getFreeUsage.queryOptions())

            router.push('/sessions');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }));

    const handleRemoveSession = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeSession.mutateAsync({ id: sessionId });
    }

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";

    return (
        <>
            <RemoveConfirmation />
            <UpdateSessionDialog
                open={updateSessionDialogOpen}
                onOpenChange={setUpdateSessionDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <SessionViewHeader
                    sessionId={sessionId}
                    sessionName={data.name}
                    onEdit={() => setUpdateSessionDialogOpen(true)}
                    onRemove={handleRemoveSession}
                />
                { isCancelled && 
                    <CancelledState />
                }
                { isUpcoming && 
                    <UpcomingState 
                        sessionId={sessionId}
                    />
                }
                { isActive && 
                    <ActiveState sessionId={sessionId} />
                }
                { isProcessing &&
                    <ProcessingState />
                }
                { isCompleted && 
                   <CompletedState data={data}/>
                }
            </div>
        </>
    )
}

export const SessionViewError = () => {
    return (
        <ErrorState title="Error loading session" description="Something went wrong while fetching this session, try again later" />
    )
}

export const SessionViewLoading = () => {
    return (
        <LoadingState title="Loading session" description="This may take a moment" />
    )
}
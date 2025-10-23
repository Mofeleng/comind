"use client";

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "../components/call-provider";

interface Props {
    sessionId: string;

}

export const CallView = ({ sessionId }:Props) => {
    const trcp = useTRPC();
    const { data } = useSuspenseQuery(trcp.sessions.getOne.queryOptions({ 
        id: sessionId
    }));

    if (data.status === "completed") {
        return (
            <div className="flex h-screen items-center justify-center">
                <ErrorState 
                    title="Session has ended"
                    description="You cannot join this session"
                />
            </div>
        )
    }

    return <CallProvider sessionId={data.id} sessionName={ data.name }/>
}
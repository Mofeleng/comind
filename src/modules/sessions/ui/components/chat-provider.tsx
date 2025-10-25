"use client";

import { LoadingState } from "@/components/loading-state";
import { authClient } from "@/lib/auth-client";
import { ChatUI } from "./chat-ui";

interface Props {
    sessionId: string;
    sessionName: string;
}

export const ChatProvider = ({ sessionId, sessionName }:Props) => {
    const { data, isPending } = authClient.useSession();

    if (!data?.user || isPending) {
        return (
            <LoadingState
                title="Loading chat"
                description="Please wait"
            />
        )
    }
    return (
        <ChatUI
            sessionId={sessionId}
            sessionName={sessionName}
            userId={data.user.id}
            userName={data.user.name}
            userImage={data.user.image ?? ""}
        />
    )
}
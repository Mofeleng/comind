"use client";

import { useTRPC } from "@/trpc/client";
import { Call, StreamVideoClient, CallingState, StreamVideo, StreamCall } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CallUI } from "./call-ui";

interface Props {
    sessionId: string;
    sessionName: string;
    userId: string;
    userName: string;
    userImage: string;
}

export const CallConnect = ({ sessionId, sessionName, userId, userImage, userName }:Props) => {
    const trcp = useTRPC();
    const { mutateAsync: generateToken } = useMutation(trcp.sessions.generateToken.mutationOptions());

    const [ client, setClient ] = useState<StreamVideoClient>();

    useEffect(()=> {
        const _client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage
            },
            tokenProvider: generateToken
        });
        setClient(_client);

        return () => {
            _client.disconnectUser();
            setClient(undefined);
        }
    }, [userId, userName, userImage, generateToken]);

    const [ call, setCall ] = useState<Call>();

    useEffect(() => {
        if (!client) return;

        const _call = client.call("default", sessionId);
        _call.camera.disable();
        _call.microphone.disable();

        setCall(_call);

        return () => {
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave();
                _call.endCall();
                setCall(undefined);
            }
        }
    }, [client, sessionId]);

    if (!client || !call) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="animate-spin text-white"/>
            </div>
        )
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUI sessionName={sessionName} />
            </StreamCall>
        </StreamVideo>
    )
}
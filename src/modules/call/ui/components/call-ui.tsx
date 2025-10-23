"use client";

import { useCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
    sessionName: string;
}

export const CallUI = ({sessionName}:Props) => {
    const call = useCall();
    const [ show, setShow ] = useState<"lobby" | "call" | "ended">("lobby");

    const handleJoin = async () => {
        if (!call) return;

        await call.join();
        setShow("call");
    }

    const handleLeave = () => {
        if (!call) return;

        call.endCall();
        setShow("ended");
    }

    return (
        <StreamTheme className="h-full">
            { show === "lobby" && <CallLobby onJoin={handleJoin} />}
            { show === "call" && <CallActive onLeave={handleLeave} sessionName={sessionName} />}
            { show === "ended" && <CallEnded />}
        </StreamTheme>
    )    
}
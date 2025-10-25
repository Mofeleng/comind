"use client";

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { VideoIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    sessionId: string;
}

export const UpcomingState = ({ sessionId }:Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/upcoming.svg"
                title="Not started yet"
                description="Your summary will appear here after you have started your session."
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2">
                <Button
                    asChild 
                    className="w-full lg:auto"
                >
                    <Link href={`/call/${sessionId}`}>
                        <VideoIcon />
                        Start Session
                    </Link>
                </Button>
            </div>
        </div>
    )
}
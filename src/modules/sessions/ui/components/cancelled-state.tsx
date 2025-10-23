"use client";

import { EmptyState } from "@/components/empty-state"

export const CancelledState = () => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/cancelled.svg"
                title="Session was cancelled"
                description="This session has been cancelled and is no longer set to take place"
            />
        </div>
    )
}
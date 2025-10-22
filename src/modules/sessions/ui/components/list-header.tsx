"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NewSessionDialog } from "./new-session-dialog";
import { useState } from "react";

export const SessionsListHeader = () => {
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    return (
        <>
            <NewSessionDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Sessions</h5>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <PlusIcon />
                        New Session
                    </Button>
                </div>
                <div className="flex items-center gap-x-2 p-1">
                </div>
            </div>
        </>
    )
}
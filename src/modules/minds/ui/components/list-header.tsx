"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NewMindDialog } from "./new-mind-dialog";
import { useState } from "react";

export const MindsListHeader = () => {
    const [isDialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <NewMindDialog
                open={isDialogOpen}
                onOpenChange={setDialogOpen}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">My Minds</h5>
                    <Button
                        onClick={() => setDialogOpen(true)}
                    >
                        <PlusIcon />
                        Add Mind
                    </Button>
                </div>
            </div>
        </>
    )
}
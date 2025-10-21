"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMindDialog } from "./new-mind-dialog";
import { useState } from "react";
import { useMindsFilter } from "../../hooks/use-minds-filter";
import { MindsSearchFilter } from "./minds-search-filter";
import { DEFAULT_PAGE } from "@/constants";

export const MindsListHeader = () => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [ filters, setFilters ] = useMindsFilter();
    const isFilterModified = !!filters.search;

    const onClearFilters = () => {
        setFilters({
            search: "",
            page: DEFAULT_PAGE
        })
    }

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
                        New Mind
                    </Button>
                </div>
                <div className="flex items-center gap-x-2 p-1">
                    <MindsSearchFilter />
                    { isFilterModified && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                        >
                            <XCircleIcon />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}
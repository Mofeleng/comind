import { CommandResponsiveDialog, CommandInput, CommandItem, CommandList, CommandGroup, CommandEmpty } from "@/components/ui/command"
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }:Props) => {
    const router = useRouter();
    const [ search, setSearch ] = useState("");

    const trcp = useTRPC();
    const sessions = useQuery(trcp.sessions.getMany.queryOptions({
        search,
        pageSize: 100
    }));

    const minds = useQuery(trcp.minds.getMany.queryOptions({
        search,
        pageSize: 100
    }));


    return (
        <CommandResponsiveDialog
            open={open}
            onOpenChange={setOpen}
            shouldFilter={false}
        >
            <CommandInput
                placeholder="Search for a session or mind..."
                value={search}
                onValueChange={(value) => setSearch(value)}
            />
            <CommandList>
                <CommandGroup heading="Sessions">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No sessions found
                        </span>
                    </CommandEmpty>
                    { sessions?.data?.items.map((session) => (
                        <CommandItem
                            key={session.id}
                            onSelect={() => {
                                router.push(`/sessions/${session.id}`)
                                setOpen(false);
                            }}
                        >
                            { session.name }
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandGroup heading="Minds">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No minds found
                        </span>
                    </CommandEmpty>
                    { minds?.data?.items.map((mind) => (
                        <CommandItem
                            key={mind.id}
                            onSelect={() => {
                                router.push(`/minds/${mind.id}`)
                                setOpen(false);
                            }}
                        >
                            { mind.name }
                        </CommandItem>
                    ))}
                </CommandGroup>

            </CommandList>
        </CommandResponsiveDialog>
    )
}
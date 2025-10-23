import { useTRPC } from "@/trpc/client";
import { useSessionsFilter } from "../../hooks/use-sessions-filter"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommandSelect } from "./command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";

export const MindIdFilter = () => {
    const [ filter, setFilters ] = useSessionsFilter();
    const trcp = useTRPC();
    const [ mindSearch, setMindSearch ] = useState("");

    const { data } = useQuery(trcp.minds.getMany.queryOptions({
        pageSize: 100,
        search: mindSearch
    }));

    return (
        <CommandSelect
            className="h-9"
            placeholder="Mind"
            options={(data?.items ?? []).map((mind) => (
                {
                    id: mind.id,
                    value: mind.id,
                    children: (
                        <div className="flex items-center gap-x-2">
                            <GeneratedAvatar
                                seed={mind.name}
                                variant="botttsNeutral"
                                className="size-4"
                            />
                            { mind.name }
                        </div>
                    )
                }
            ))}
            onSelect={(value) => setFilters({ mindId: value })}
            onSearch={setMindSearch}
            value={filter.mindId ?? ""}
        />
    )
}
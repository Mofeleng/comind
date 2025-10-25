import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MAX_FREE_MINDS, MAX_FREE_SESSIONS } from "@/modules/premium/constants";
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query";
import { RocketIcon } from "lucide-react";
import Link from "next/link";

export const DashboardTrial = () => {
    const trcp = useTRPC();
    const { data } = useQuery(trcp.premium.getFreeUsage.queryOptions());

    if (!data) return null;

    return (
        <div className="border border-border/10 rounded-lg w-full bg-white/5 flex flex-col gap-y-2">
            <div className="p-3 flex flex-col gap-y-4">
                <div className="flex items-center gap-2">
                    <RocketIcon className="size-4" />
                    <p className="text-sm font-medium">Free plan</p>
                </div>
                <div className="flex flex-col gap-y-2">
                    <p className="text-sm">
                        { data.mindCount }/{MAX_FREE_MINDS} Minds
                    </p>
                    <Progress value={(data.mindCount / MAX_FREE_MINDS) * 100} />
                </div>
                <div className="flex flex-col gap-y-2">
                    <p className="text-sm">
                        { data.sessionCount }/{MAX_FREE_SESSIONS} Sessions
                    </p>
                    <Progress value={(data.sessionCount / MAX_FREE_SESSIONS) * 100} />
                </div>
            </div>
            <Button
                asChild
                className="bg-transparent border-t border-border/10 hover:bg-white/10 rounded-t-none"
            >
                <Link href="/upgrade">
                    Upgrade
                </Link>
            </Button>
        </div>
    )
}
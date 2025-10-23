import type { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type MindData = inferRouterOutputs<AppRouter>["minds"]["getOne"];
export type MindsData = inferRouterOutputs<AppRouter>["minds"]["getMany"]["items"];
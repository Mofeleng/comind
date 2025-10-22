import type { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type SessionData = inferRouterOutputs<AppRouter>["sessions"]["getOne"];
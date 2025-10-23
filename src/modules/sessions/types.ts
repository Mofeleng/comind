import type { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type SessionData = inferRouterOutputs<AppRouter>["sessions"]["getOne"];
export type SessionsData = inferRouterOutputs<AppRouter>["sessions"]["getMany"]["items"];

export enum SessionStatus {
    Upcoming = "upcoming",
    Active = "active",
    Completed = "completed",
    Processing = "processing",
    Cancelled = "cancelled"
}
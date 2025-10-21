import { db } from "@/db";
import { minds } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import z from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";
export const agentsRouter = createTRPCRouter({
    //TODO: Change getMany to use protected procedure
    getMany: protectedProcedure.query(async () => {
        const data = await db.select().from(minds);
        return data;
    }),
    getOne: protectedProcedure.input(z.object({id: z.string()})).query(async ({ input }) => {
        const [existingMind] = await db.select({
            ...getTableColumns(minds),
            sessionsCount: sql<number>`5`,
        }).from(minds).where(eq(minds.id, input.id));

        return existingMind;
    }),
    create: protectedProcedure.input(agentsInsertSchema).mutation(async ({ input, ctx }) => {
        const [createdMind] = await db.insert(minds).values({
            ...input,
            userId: ctx.auth.user.id
        }).returning();

        return createdMind;
    })
})
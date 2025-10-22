import { db } from "@/db";
import { minds } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schemas";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
export const agentsRouter = createTRPCRouter({
    //TODO: Change getMany to use protected procedure
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish()
    })).query(async ({ ctx, input }) => {
        const { search, page, pageSize } = input;

        const data = await db.select({
            ...getTableColumns(minds),
            sessionsCount: sql<number>`5`,
        }).from(minds).where(and(
            eq(minds.userId, ctx.auth.user.id),
            search ? ilike(minds.name, `%${search}%`) : undefined
        )).orderBy(desc(minds.createdAt), desc(minds.id)).limit(pageSize).offset((page - 1) * pageSize);

        const [total] = await db.select({ count: count() }).from(minds).where(and(
            eq(minds.userId, ctx.auth.user.id),
            search ? ilike(minds.name, `%${search}%`) : undefined
        ));

        const totalPages = Math.ceil(total.count / pageSize);

        return {
            items: data,
            total: total.count,
            totalPages
        }
    }),
    getOne: protectedProcedure.input(z.object({
        id: z.string()
    })).query(async ({ input, ctx }) => {
        const [existingMind] = await db.select({
            ...getTableColumns(minds),
            sessionsCount: sql<number>`5`,
        }).from(minds).where(and(
            eq(minds.id, input.id),
            eq(minds.userId, ctx.auth.user.id)
        ));

        if (!existingMind) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Mind not found"})
        }

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
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { sessionsInsertSchema, sessionsUpdateSchema } from "../schemas";

export const sessionsRouter = createTRPCRouter({
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish()
    })).query(async ({ ctx, input }) => {
        const { search, page, pageSize } = input;

        const data = await db.select({
            ...getTableColumns(sessions),
            sessionsCount: sql<number>`5`,
        }).from(sessions).where(and(
            eq(sessions.userId, ctx.auth.user.id),
            search ? ilike(sessions.name, `%${search}%`) : undefined
        )).orderBy(desc(sessions.createdAt), desc(sessions.id)).limit(pageSize).offset((page - 1) * pageSize);

        const [total] = await db.select({ count: count() }).from(sessions).where(and(
            eq(sessions.userId, ctx.auth.user.id),
            search ? ilike(sessions.name, `%${search}%`) : undefined
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
        const [existingSession] = await db.select({
            ...getTableColumns(sessions),
            sessionsCount: sql<number>`5`,
        }).from(sessions).where(and(
            eq(sessions.id, input.id),
            eq(sessions.userId, ctx.auth.user.id)
        ));

        if (!existingSession) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Session not found"})
        }

        return existingSession;
    }),
    create: protectedProcedure.input(sessionsInsertSchema).mutation(async ({ input, ctx }) => {
        const [createdSession] = await db.insert(sessions).values({
            ...input,
            userId: ctx.auth.user.id
        }).returning();

        return createdSession;
    }),
    update: protectedProcedure.input(sessionsUpdateSchema).mutation(async ({ input, ctx }) => {
            const [updatedSession] = await db.update(sessions).set(input).where(and(
                eq(sessions.id, input.id),
                eq(sessions.userId, ctx.auth.user.id)
            )).returning();
    
            if (!updatedSession) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Session not found"})
            }
    
            return updatedSession;
        })
})
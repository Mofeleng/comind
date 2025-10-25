import { db } from "@/db";
import { minds, sessions, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { and, count, desc, eq, getTableColumns, ilike, inArray, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";
import { sessionsInsertSchema, sessionsUpdateSchema } from "../schemas";
import { SessionStatus, StreamTranscriptItem } from "../types";
import { StreamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/create-avatar";
import JSONL from "jsonl-parse-stringify";
import { streamChat } from "@/lib/stream-chat";

export const sessionsRouter = createTRPCRouter({
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        mindId: z.string().nullish(),
        status: z.enum([ SessionStatus.Upcoming, SessionStatus.Active, SessionStatus.Completed, SessionStatus.Processing, SessionStatus.Cancelled ]).nullish()
    })).query(async ({ ctx, input }) => {
        const { search, page, pageSize, status, mindId } = input;

        const data = await db.select({
            ...getTableColumns(sessions),
            mind: minds,
            duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration")
        }).from(sessions).innerJoin(minds, 
            eq(sessions.mindId, minds.id)
        ).where(and(
            eq(sessions.userId, ctx.auth.user.id),
            search ? ilike(sessions.name, `%${search}%`) : undefined,
            status ? eq(sessions.status, status) : undefined,
            mindId ? eq(sessions.mindId, mindId) : undefined

        )).orderBy(desc(sessions.createdAt), desc(sessions.id)).limit(pageSize).offset((page - 1) * pageSize);

        const [total] = await db.select({ count: count() }).from(sessions).innerJoin(minds, 
            eq(sessions.mindId, minds.id)
        ).where(and(
            eq(sessions.userId, ctx.auth.user.id),
            search ? ilike(sessions.name, `%${search}%`) : undefined,
            status ? eq(sessions.status, status) : undefined,
            mindId ? eq(sessions.mindId, mindId) : undefined
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
            mind: minds,
            duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration")
        }).from(sessions).innerJoin(minds, eq(sessions.mindId, minds.id)).where(and(
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

        const call = StreamVideo.video.call("default", createdSession.id);
        await call.create({
            data: {
                created_by_id: ctx.auth.user.id,
                custom: {
                    sessionId: createdSession.id,
                    sessionName: createdSession.name
                },
                settings_override: {
                    transcription: {
                        language: "en",
                        mode: "auto-on",
                        closed_caption_mode: "auto-on"
                    },
                    recording: {
                        mode: "auto-on",
                        quality: "720p" //increase resolution here
                    }
                }
            }
        });

        const [existingMind] = await db.select().from(minds).where(
            eq(minds.id, createdSession.mindId)
        );

        if (!existingMind) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Mind not found"
            });
        }

        await StreamVideo.upsertUsers([
            {
                id: existingMind.id,
                name: existingMind.name,
                role: "user",
                image: generateAvatarUri({ variant: "botttsNeutral", seed: existingMind.name })
            }
        ]);

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
    }),
    remove: protectedProcedure.input(z.object({
        id: z.string()
    })).mutation(async ({ input, ctx }) => {
        const [ removedSession] = await db.delete(sessions).where(and(
            eq(sessions.id, input.id),
            eq(sessions.userId, ctx.auth.user.id)
        )).returning();

        if (!removedSession) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Session not found"})
        }

        return removedSession;
    }),
    generateToken: protectedProcedure.mutation(async ({ ctx }) => {
        await StreamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                role: "admin",
                image: ctx.auth.user.image ?? generateAvatarUri({ variant: "initials", seed: ctx.auth.user.name })
            }
        ]);

        const expirationTime = Math.floor(Date.now() / 1000) * 3600;
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        const token = StreamVideo.generateUserToken({
            user_id: ctx.auth.user.id,
            exp: expirationTime,
            validity_in_seconds: issuedAt
        });

        return token;
    }),
    getTranscript: protectedProcedure.input(z.object({
        id: z.string()
    })).query(async ({ input, ctx}) => {
        const [existingSession] = await db.select().from(sessions).where(and(
            eq(sessions.id, input.id), eq(sessions.userId, ctx.auth.user.id)
        ));

        if (!existingSession) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Session not found"})
        }

        if (!existingSession.transcriptUrl) {
            return [];
        }

        const transcript = await fetch(existingSession.transcriptUrl)
                                    .then((res) => res.text())
                                    .then((text) => JSONL.parse<StreamTranscriptItem>(text))
                                    .catch(() => {
                                        return []
                                    })
        
        const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id))
        ];

        const userSpeakers = await db.select().from(user).where(
            inArray(user.id, speakerIds)
        ).then((users) => users.map((user) => ({
            ...user,
            image: user.image ?? generateAvatarUri({ variant: "initials", seed: user.name })
        })));

        const mindSpeakers = await db.select().from(minds).where(
            inArray(minds.id, speakerIds)
        ).then((minds) => minds.map((mind) => ({
            ...mind,
            image: generateAvatarUri({
                variant: "botttsNeutral",
                seed: mind.name
            })
        })));

        const speakers = [...userSpeakers, ...mindSpeakers];

        const transcriptWIthSpeakers = transcript.map((item) => {
            const speaker = speakers.find((speaker) => speaker.id === item.speaker_id)

            if (!speaker) {
            return {
                ...item,
                user: {
                    name: "Unknown",
                    image: generateAvatarUri({
                        seed: "Unknown",
                        variant: "initials"
                    })
                }
            }
            }

            return {
                ...item,
                user: {
                    name: speaker.name,
                    image: speaker.image
                }
            }
      });

      return transcriptWIthSpeakers;
    }),
    generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
        const token = streamChat.createToken(ctx.auth.user.id);
        
        await streamChat.upsertUser({
            id: ctx.auth.user.id,
            role: "admin"
        });

        return token;
    })
})
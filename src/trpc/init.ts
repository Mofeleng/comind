import { db } from '@/db';
import { minds, sessions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { polarClient } from '@/lib/polar';
import { MAX_FREE_MINDS, MAX_FREE_SESSIONS } from '@/modules/premium/constants';
import { initTRPC, TRPCError } from '@trpc/server';
import { count, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
   const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized"})
    }

    return next({ctx: { ...ctx, auth: session }});
});

export const premiumProcedure = (entity: "sessions" | "minds") => 
  protectedProcedure.use(async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id
    });

    const [userSessions] = await db.select({
        count: count(sessions.id)
    }).from(sessions).where(eq(sessions.userId, ctx.auth.user.id));

      const [userMinds] = await db.select({
        count: count(minds.id)
    }).from(minds).where(eq(minds.userId, ctx.auth.user.id));

    const isPremium = customer.activeSubscriptions.length > 0;
    const isFreeMindLimitReached = userMinds.count >= MAX_FREE_MINDS;
    const isFreeSessionLimitReached = userSessions.count >= MAX_FREE_SESSIONS;

    const shouldThrowSessionError = entity === "sessions" && isFreeSessionLimitReached && !isPremium;
    const shouldThrowMindError = entity === "minds" && isFreeMindLimitReached && !isPremium;

    if (shouldThrowSessionError) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free sessions"
      });
    }

    if (shouldThrowMindError) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free minds"
      });
    }

    return next({ ctx: { ...ctx, customer }})
  });

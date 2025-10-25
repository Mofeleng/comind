import { db } from "@/db";
import { minds, sessions } from "@/db/schema";
import { polarClient } from "@/lib/polar";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { count, eq } from "drizzle-orm";

export const premiumRouter = createTRPCRouter({
    getProducts: protectedProcedure.query(async () => {
        const products = await polarClient.products.list({
            isArchived: false,
            isRecurring: true,
            sorting: ["price_amount"]
        });

        return products.result.items;
    }),
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
        const customer = await polarClient.customers.getStateExternal({
            externalId: ctx.auth.user.id
        });

        const subscription = customer.activeSubscriptions[0];

        if (!subscription) {
            return null;
        }

        const product = await polarClient.products.get({
            id: subscription.productId,
        });

        return product;
    }),
    getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
        const customer = await polarClient.customers.getStateExternal({
            externalId: ctx.auth.user.id
        });

        const subscription = customer.activeSubscriptions[0];

        if (subscription) {
            return null;
        }

        //count sessions and minds user has created
        const [userSessions] = await db.select({
            count: count(sessions.id)
        }).from(sessions).where(eq(sessions.userId, ctx.auth.user.id));

         const [userMinds] = await db.select({
            count: count(minds.id)
        }).from(minds).where(eq(minds.userId, ctx.auth.user.id));

        return {
            sessionCount: userSessions.count,
            mindCount: userMinds.count
        }
    })
})
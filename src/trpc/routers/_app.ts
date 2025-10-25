import { sessionsRouter } from '@/modules/sessions/server/procedures';
import { createTRPCRouter } from '../init';
import { mindsRouter } from '@/modules/minds/server/procedures';
import { premiumRouter } from '@/modules/premium/server/procedures';

export const appRouter = createTRPCRouter({
  minds: mindsRouter,
  sessions: sessionsRouter,
  premium: premiumRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
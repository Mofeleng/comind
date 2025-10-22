import { sessionsRouter } from '@/modules/sessions/server/procedures';
import { createTRPCRouter } from '../init';
import { mindsRouter } from '@/modules/minds/server/procedures';

export const appRouter = createTRPCRouter({
  minds: mindsRouter,
  sessions: sessionsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
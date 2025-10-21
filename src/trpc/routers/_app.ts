import { createTRPCRouter } from '../init';
import { agentsRouter } from '@/modules/minds/server/procedures';
export const appRouter = createTRPCRouter({
  minds: agentsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
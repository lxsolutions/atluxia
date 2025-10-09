

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@rentshield/api';

// Create a context for the fetch adapter
const createContext = async () => {
  return {
    req: {} as any,
    res: {} as any,
  };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };


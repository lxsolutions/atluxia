
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@rentshield/api';

export const trpc = createTRPCReact<AppRouter>();

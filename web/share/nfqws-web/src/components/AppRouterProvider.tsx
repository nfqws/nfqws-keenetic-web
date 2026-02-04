import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, type RegisteredRouter } from '@tanstack/react-router';

import { queryClient } from '@/api/client';

import { createRouterProviderContext } from '@/utils/createRouterProviderContext';

export function AppRouterProvider({ router }: { router: RegisteredRouter }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={createRouterProviderContext(queryClient)}
      />
    </QueryClientProvider>
  );
}

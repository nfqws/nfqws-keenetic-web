import { useAuth } from '@/store/useAuth';
import { requestFn } from '@openapi-qraft/react';
import type { OperationError } from '@openapi-qraft/tanstack-query-react-types';
import { QueryClient, type UseQueryResult } from '@tanstack/react-query';

import { baseUrl } from '@/api/baseUrl';
import { createAPIClient } from '@/api/create-api-client';
import type {
  ApiError,
  FileContentResponse,
  FilenamesResponse,
  StatusResponse,
} from '@/api/schema';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

const apiClient = createAPIClient({
  baseUrl,
  queryClient,
  requestFn: async (schema, requestInfo) => {
    const result = await requestFn(schema, requestInfo);
    const status = result.response?.status;
    if (status === 401) {
      useAuth.getState().setAuth(false);
    } else if (status && status >= 200 && status < 300) {
      useAuth.getState().setAuth(true);
    }
    return result;
  },
});

export const API = {
  status: () =>
    apiClient.indexPhp.postIndexCmd.useQuery({
      body: { cmd: 'status' },
    }) as UseQueryResult<StatusResponse, OperationError<ApiError>>,
  listFiles: () =>
    apiClient.indexPhp.postIndexCmd.useQuery({
      body: { cmd: 'filenames' },
    }) as UseQueryResult<FilenamesResponse, OperationError<ApiError>>,
  fileContent: (filename: FilenamesResponse['files'][0]) =>
    apiClient.indexPhp.postIndexCmd.useQuery({
      body: { cmd: 'filecontent', filename },
    }) as UseQueryResult<FileContentResponse, OperationError<ApiError>>,
  filesave: (filename: string, content: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'filesave', filename, content },
    }),
  fileremove: (filename: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'fileremove', filename },
    }),
  action: (cmd: 'reload' | 'restart' | 'stop' | 'start' | 'upgrade') =>
    apiClient.indexPhp.postIndexCmd({ body: { cmd } }),
  login: (user: string, password: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'login', user, password },
    }),
  logout: () => apiClient.indexPhp.postIndexCmd({ body: { cmd: 'logout' } }),
} as const;

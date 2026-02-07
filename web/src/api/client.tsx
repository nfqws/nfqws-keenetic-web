import { requestFn } from '@openapi-qraft/react';
import type {
  OperationError,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';
import { QueryClient, type UseQueryResult } from '@tanstack/react-query';

import { baseUrl } from '@/api/baseUrl';
import { createAPIClient } from '@/api/create-api-client';
import {
  type ActionResponse,
  type ApiError,
  type CheckResponse,
  type FileContentResponse,
  type FilenamesRequest,
  type FilenamesResponse,
  type FileRemoveResponse,
  type FileSaveResponse,
  type LoginResponse,
  type LogoutResponse,
  type ServiceActionRequest,
  type StatusResponse,
} from '@/api/schema';

import { useAppStore } from '@/store/useAppStore';

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
      useAppStore.getState().setAuth(false);
    } else if (status && status >= 200 && status < 300) {
      useAppStore.getState().setAuth(true);
    }
    return result;
  },
});

export const API = {
  status: () =>
    apiClient.indexPhp.postIndexCmd.useQuery({
      body: { cmd: 'status' },
    }) as UseQueryResult<StatusResponse, OperationError<ApiError>>,

  invalidateStatus: async () => {
    const key = apiClient.indexPhp.postIndexCmd.getQueryKey({
      body: { cmd: 'status' },
    });
    return queryClient.invalidateQueries({ queryKey: key });
  },

  listFiles: (type?: FilenamesRequest['type']) =>
    apiClient.indexPhp.postIndexCmd.useQuery({
      body: { cmd: 'filenames', type },
    }) as UseQueryResult<FilenamesResponse, OperationError<ApiError>>,

  invalidateListFiles: async () => {
    const key = apiClient.indexPhp.postIndexCmd.getQueryKey({
      body: { cmd: 'filenames' },
    });
    return queryClient.invalidateQueries({ queryKey: key });
  },

  fileContent: (filename: FilenamesResponse['files'][0], enabled = true) =>
    apiClient.indexPhp.postIndexCmd.useQuery(
      {
        body: { cmd: 'filecontent', filename },
      },
      { enabled },
    ) as UseQueryResult<FileContentResponse, OperationError<ApiError>>,

  invalidateFileContent: async (filename: FilenamesResponse['files'][0]) => {
    const key = apiClient.indexPhp.postIndexCmd.getQueryKey({
      body: { cmd: 'filecontent', filename },
    });
    return queryClient.invalidateQueries({ queryKey: key });
  },

  saveFile: async (filename: string, content: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'filesave', filename, content },
    }) as Promise<RequestFnResponse<FileSaveResponse, ApiError>>,

  removeFile: async (filename: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'fileremove', filename },
    }) as Promise<RequestFnResponse<FileRemoveResponse, ApiError>>,

  action: async (cmd: ServiceActionRequest['cmd']) =>
    apiClient.indexPhp.postIndexCmd({ body: { cmd } }) as Promise<
      RequestFnResponse<ActionResponse, ApiError>
    >,

  login: async (user: string, password: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'login', user, password },
    }) as Promise<RequestFnResponse<LoginResponse, ApiError>>,

  logout: async () =>
    apiClient.indexPhp.postIndexCmd({ body: { cmd: 'logout' } }) as Promise<
      RequestFnResponse<LogoutResponse, ApiError>
    >,

  check: async (url: string) =>
    apiClient.indexPhp.postIndexCmd({
      body: { cmd: 'check', url },
    }) as Promise<RequestFnResponse<CheckResponse, ApiError>>,
} as const;

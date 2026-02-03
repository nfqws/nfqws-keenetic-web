import { API } from '@/api/client';

export const useStatus = () => {
  return API.status();
};

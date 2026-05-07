import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { IMetrics, ApiSuccess } from '@mudanza/types';

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => api<ApiSuccess<IMetrics>>('/metrics'),
    select: (data) => data.data,
    staleTime: 30_000,
  });
}

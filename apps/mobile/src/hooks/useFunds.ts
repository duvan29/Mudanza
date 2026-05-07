import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { IFund, ApiSuccess } from '@mudanza/types';

export function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: () => api<ApiSuccess<IFund[]>>('/funds'),
    select: (data) => data.data,
    staleTime: 30_000,
  });
}

export function useFund(id: string) {
  return useQuery({
    queryKey: ['funds', id],
    queryFn: () => api<ApiSuccess<IFund>>(`/funds/${id}`),
    select: (data) => data.data,
    enabled: !!id,
  });
}

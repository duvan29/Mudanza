import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { IMovement, ICreateMovement, ApiSuccess } from '@mudanza/types';

export function useMovements(fundId?: string) {
  return useQuery({
    queryKey: ['movements', fundId],
    queryFn: () =>
      api<{ data: IMovement[]; total: number }>('/movements', {
        params: { fundId, limit: 50 },
      }),
    select: (data) => data.data,
    staleTime: 30_000,
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateMovement) =>
      api<ApiSuccess<IMovement>>('/movements', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<ApiSuccess<IMovement>>(`/movements/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

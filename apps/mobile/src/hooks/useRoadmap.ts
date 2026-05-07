import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { IRoadmapMonth, ApiSuccess } from '@mudanza/types';

export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => api<ApiSuccess<IRoadmapMonth[]>>('/roadmap'),
    select: (data) => data.data,
    staleTime: 60_000,
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; note?: string | null }) =>
      api<ApiSuccess<IRoadmapMonth>>(`/roadmap/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });
}

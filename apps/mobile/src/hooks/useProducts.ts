import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type {
  IProductGoal,
  IProductVersion,
  ICreateProductGoal,
  ICreateProductVersion,
  ApiSuccess,
} from '@mudanza/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api<ApiSuccess<IProductGoal[]>>('/products'),
    select: (data) => data.data,
    staleTime: 30_000,
  });
}

export function useVersions(goalId: string) {
  return useQuery({
    queryKey: ['versions', goalId],
    queryFn: () => api<ApiSuccess<IProductVersion[]>>(`/products/${goalId}/versions`),
    select: (data) => data.data,
    enabled: !!goalId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateProductGoal) =>
      api<ApiSuccess<IProductGoal>>('/products', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateVersion(goalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateProductVersion) =>
      api<ApiSuccess<IProductVersion>>(`/products/${goalId}/versions`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', goalId] });
    },
  });
}

export function useChooseVersion(goalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      api<ApiSuccess<IProductVersion>>(`/products/versions/${versionId}/choose`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', goalId] });
    },
  });
}

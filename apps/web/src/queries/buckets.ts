import type {
	Bucket,
	CreateBucketInput,
	UpdateBucketInput,
} from "@repo/api-types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { api } from "#/lib/api-client";

export const bucketKeys = {
	all: ["buckets"] as const,
	detail: (id: string) => ["buckets", id] as const,
};

export function bucketsQueryOptions() {
	return queryOptions({
		queryKey: bucketKeys.all,
		queryFn: () => api.get<Bucket[]>("/buckets"),
	});
}

export function bucketQueryOptions(id: string) {
	return queryOptions({
		queryKey: bucketKeys.detail(id),
		queryFn: () => api.get<Bucket>(`/buckets/${id}`),
	});
}

export function useCreateBucket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateBucketInput) =>
			api.post<Bucket>("/buckets", input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: bucketKeys.all });
		},
	});
}

export function useUpdateBucket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateBucketInput }) =>
			api.patch<Bucket>(`/buckets/${id}`, input),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: bucketKeys.all });
			queryClient.invalidateQueries({ queryKey: bucketKeys.detail(id) });
		},
	});
}

export function useDeleteBucket() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.delete<void>(`/buckets/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: bucketKeys.all });
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}

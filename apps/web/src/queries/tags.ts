import type { CreateTagInput, Tag, UpdateTagInput } from "@repo/api-types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { api } from "#/lib/api-client";

export const tagKeys = {
	all: ["tags"] as const,
	detail: (id: string) => ["tags", id] as const,
};

export function tagsQueryOptions() {
	return queryOptions({
		queryKey: tagKeys.all,
		queryFn: () => api.get<Tag[]>("/tags"),
	});
}

export function useCreateTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateTagInput) => api.post<Tag>("/tags", input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
		},
	});
}

export function useUpdateTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) =>
			api.patch<Tag>(`/tags/${id}`, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}

export function useDeleteTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.delete<void>(`/tags/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
	});
}

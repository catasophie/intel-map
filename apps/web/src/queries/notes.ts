import type {
	CreateIntelNoteInput,
	IntelNote,
	QueryIntelNoteInput,
	UpdateIntelNoteInput,
} from "@repo/api-types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { api } from "#/lib/api-client";

export const noteKeys = {
	all: ["notes"] as const,
	list: (bucketIds: string[]) =>
		["notes", [...bucketIds].sort().join(",")] as const,
};

function buildNotesPath(query: QueryIntelNoteInput): string {
	const params = new URLSearchParams();
	if (query.bucketIds && query.bucketIds.length > 0) {
		params.set("bucketIds", query.bucketIds.join(","));
	} else if (query.bucketId) {
		params.set("bucketId", query.bucketId);
	}
	const qs = params.toString();
	return qs ? `/notes?${qs}` : "/notes";
}

export function notesQueryOptions(bucketIds: string[]) {
	return queryOptions({
		queryKey: noteKeys.list(bucketIds),
		queryFn: () => api.get<IntelNote[]>(buildNotesPath({ bucketIds })),
		enabled: bucketIds.length > 0,
	});
}

export function useCreateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateIntelNoteInput) =>
			api.post<IntelNote>("/notes", input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
		},
	});
}

export function useUpdateNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateIntelNoteInput }) =>
			api.patch<IntelNote>(`/notes/${id}`, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
		},
	});
}

export function useDeleteNote() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => api.delete<void>(`/notes/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: noteKeys.all });
		},
	});
}

import type { Bucket, IntelNote } from "@repo/api-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { MapPinPlusIcon, SettingsIcon, TagIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BucketTogglePanel } from "#/components/bucket-toggle-panel";
import { BucketsManagerDialog } from "#/components/buckets-manager-dialog";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { NoteFormDialog } from "#/components/note-form-dialog";
import { NotesListPanel } from "#/components/notes-list-panel";
import { NotesMap } from "#/components/notes-map";
import { TagsManagerDialog } from "#/components/tags-manager-dialog";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { bucketsQueryOptions } from "#/queries/buckets";
import {
	notesQueryOptions,
	useDeleteNote,
	useUpdateNote,
} from "#/queries/notes";
import { tagsQueryOptions } from "#/queries/tags";

interface MapSearch {
	buckets?: string;
}

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>): MapSearch => ({
		buckets: typeof search.buckets === "string" ? search.buckets : undefined,
	}),
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(bucketsQueryOptions()),
			context.queryClient.ensureQueryData(tagsQueryOptions()),
		]);
	},
	component: MapPage,
});

function MapPage() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data: allBuckets } = useSuspenseQuery(bucketsQueryOptions());
	const { data: allTags } = useSuspenseQuery(tagsQueryOptions());

	const allBucketIds = useMemo(
		() => allBuckets.map((b: Bucket) => b.id),
		[allBuckets],
	);

	// Default to showing every bucket's notes until the user narrows it down.
	const selectedBucketIds = useMemo(() => {
		if (search.buckets === undefined) return allBucketIds;
		const ids = search.buckets.split(",").filter(Boolean);
		return ids.filter((id) => allBucketIds.includes(id));
	}, [search.buckets, allBucketIds]);

	const { data: notes = [] } = useSuspenseQuery(
		notesQueryOptions(selectedBucketIds),
	);

	const [placingNote, setPlacingNote] = useState(false);
	const [pendingCoords, setPendingCoords] = useState<
		{ lat: number; lng: number } | undefined
	>();
	const [editingNote, setEditingNote] = useState<IntelNote | undefined>();
	const [formOpen, setFormOpen] = useState(false);
	const [deletingNote, setDeletingNote] = useState<IntelNote | undefined>();
	const [bucketsManagerOpen, setBucketsManagerOpen] = useState(false);
	const [tagsManagerOpen, setTagsManagerOpen] = useState(false);
	const [focusRequest, setFocusRequest] = useState<
		{ noteId: string; nonce: number } | undefined
	>();

	const updateNote = useUpdateNote();
	const deleteNote = useDeleteNote();

	function toggleBucket(id: string) {
		const next = selectedBucketIds.includes(id)
			? selectedBucketIds.filter((b) => b !== id)
			: [...selectedBucketIds, id];
		navigate({ search: { buckets: next.join(",") } });
	}

	function viewBucketOnMap(id: string) {
		navigate({ search: { buckets: id } });
	}

	function handleSelectNote(note: IntelNote) {
		setFocusRequest((prev) => ({
			noteId: note.id,
			nonce: (prev?.nonce ?? 0) + 1,
		}));
	}

	function handleMapClick(coords: { lat: number; lng: number }) {
		setPendingCoords(coords);
		setEditingNote(undefined);
		setFormOpen(true);
		setPlacingNote(false);
	}

	function handleEditNote(note: IntelNote) {
		setEditingNote(note);
		setPendingCoords(undefined);
		setFormOpen(true);
	}

	async function handleMarkerDragEnd(
		noteId: string,
		coords: { lat: number; lng: number },
	) {
		try {
			await updateNote.mutateAsync({ id: noteId, input: coords });
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to move note",
			);
		}
	}

	async function handleDeleteNote() {
		if (!deletingNote) return;
		try {
			await deleteNote.mutateAsync(deletingNote.id);
			toast.success("Note deleted");
			setDeletingNote(undefined);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete note",
			);
		}
	}

	const defaultBucketId = selectedBucketIds[0] ?? allBucketIds[0] ?? "";

	return (
		<div className="flex h-screen flex-col">
			<header className="flex items-center justify-between border-b px-4 py-3">
				<div>
					<h1 className="font-semibold leading-tight">Intel Map</h1>
					<p className="text-muted-foreground text-xs">
						{notes.length} note{notes.length === 1 ? "" : "s"} shown across{" "}
						{selectedBucketIds.length} bucket
						{selectedBucketIds.length === 1 ? "" : "s"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => setBucketsManagerOpen(true)}>
						<SettingsIcon /> Manage buckets
					</Button>
					<Button variant="outline" onClick={() => setTagsManagerOpen(true)}>
						<TagIcon /> Manage tags
					</Button>
					<Button
						variant={placingNote ? "secondary" : "default"}
						disabled={!defaultBucketId}
						onClick={() => setPlacingNote((p) => !p)}
					>
						<MapPinPlusIcon />
						{placingNote ? "Click the map to place…" : "Add note"}
					</Button>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden">
				<aside className="w-64 shrink-0 overflow-y-auto border-r p-3">
					{allBuckets.length === 0 ? (
						<Card>
							<CardContent className="text-muted-foreground py-6 text-center text-sm">
								No buckets yet.{" "}
								<button
									type="button"
									className="underline"
									onClick={() => setBucketsManagerOpen(true)}
								>
									Create one
								</button>{" "}
								to start mapping notes.
							</CardContent>
						</Card>
					) : (
						<BucketTogglePanel
							buckets={allBuckets}
							selectedIds={selectedBucketIds}
							onToggle={toggleBucket}
						/>
					)}

					{allBuckets.length > 0 && (
						<div className="mt-4 border-t pt-3">
							<NotesListPanel
								notes={notes}
								activeNoteId={focusRequest?.noteId}
								onSelect={handleSelectNote}
							/>
						</div>
					)}
				</aside>

				<div className="relative flex-1">
					<ClientOnly
						fallback={
							<div className="flex size-full items-center justify-center">
								<Skeleton className="size-full" />
							</div>
						}
					>
						<NotesMap
							notes={notes}
							placingNote={placingNote}
							onMapClick={handleMapClick}
							onMarkerDragEnd={handleMarkerDragEnd}
							onEditNote={handleEditNote}
							onDeleteNote={(note) => setDeletingNote(note)}
							focusRequest={focusRequest}
						/>
					</ClientOnly>
				</div>
			</div>

			{defaultBucketId && (
				<NoteFormDialog
					open={formOpen}
					onOpenChange={setFormOpen}
					note={editingNote}
					coords={pendingCoords}
					buckets={allBuckets}
					tags={allTags}
					defaultBucketId={defaultBucketId}
				/>
			)}
			<ConfirmDeleteDialog
				open={!!deletingNote}
				onOpenChange={(open) => !open && setDeletingNote(undefined)}
				title="Delete note?"
				description={`This will permanently delete "${deletingNote?.title}".`}
				onConfirm={handleDeleteNote}
				isPending={deleteNote.isPending}
			/>
			<BucketsManagerDialog
				open={bucketsManagerOpen}
				onOpenChange={setBucketsManagerOpen}
				buckets={allBuckets}
				onViewOnMap={viewBucketOnMap}
			/>
			<TagsManagerDialog
				open={tagsManagerOpen}
				onOpenChange={setTagsManagerOpen}
				tags={allTags}
			/>
		</div>
	);
}

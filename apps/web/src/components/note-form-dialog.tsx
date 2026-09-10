import type {
	Bucket,
	CreateIntelNoteInput,
	IntelNote,
	Tag,
} from "@repo/api-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "#/components/rich-text-editor";
import { TagMultiSelect } from "#/components/tag-multi-select";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCreateNote, useUpdateNote } from "#/queries/notes";

interface NoteFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	note?: IntelNote;
	coords?: { lat: number; lng: number };
	buckets: Bucket[];
	tags: Tag[];
	defaultBucketId: string;
}

export function NoteFormDialog({
	open,
	onOpenChange,
	note,
	coords,
	buckets,
	tags,
	defaultBucketId,
}: NoteFormDialogProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [bucketId, setBucketId] = useState(defaultBucketId);
	const [tagIds, setTagIds] = useState<string[]>([]);
	const createNote = useCreateNote();
	const updateNote = useUpdateNote();

	const isEditing = !!note;
	const isPending = createNote.isPending || updateNote.isPending;
	const activeCoords = note
		? { lat: note.lat, lng: note.lng }
		: (coords ?? { lat: 0, lng: 0 });

	useEffect(() => {
		if (open) {
			setTitle(note?.title ?? "");
			setDescription(note?.description ?? "");
			setBucketId(note?.bucketId ?? defaultBucketId);
			setTagIds(note?.tags?.map((t) => t.id) ?? []);
		}
	}, [open, note, defaultBucketId]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim()) return;

		const input: CreateIntelNoteInput = {
			title: title.trim(),
			description: description || undefined,
			lat: activeCoords.lat,
			lng: activeCoords.lng,
			bucketId,
			tagIds,
		};

		try {
			if (isEditing) {
				await updateNote.mutateAsync({ id: note.id, input });
				toast.success("Note updated");
			} else {
				await createNote.mutateAsync(input);
				toast.success("Note created");
			}
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Something went wrong",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit note" : "New intel note"}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="note-title">Title</Label>
							<Input
								id="note-title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Sighting near the harbor"
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="note-bucket">Bucket</Label>
							<Select value={bucketId} onValueChange={setBucketId}>
								<SelectTrigger id="note-bucket" className="w-full">
									<SelectValue placeholder="Select a bucket" />
								</SelectTrigger>
								<SelectContent>
									{buckets.map((bucket) => (
										<SelectItem key={bucket.id} value={bucket.id}>
											{bucket.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label>Location</Label>
							<p className="text-muted-foreground text-xs">
								{activeCoords.lat.toFixed(5)}, {activeCoords.lng.toFixed(5)}
								{isEditing && " — drag the marker on the map to reposition"}
							</p>
						</div>

						<div className="grid gap-2">
							<Label>Tags</Label>
							<TagMultiSelect
								tags={tags}
								selectedIds={tagIds}
								onChange={setTagIds}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="note-description">Description</Label>
							<RichTextEditor value={description} onChange={setDescription} />
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							{isEditing ? "Save changes" : "Create note"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

import type { Tag } from "@repo/api-types";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { TagFormDialog } from "#/components/tag-form-dialog";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useDeleteTag } from "#/queries/tags";

interface TagsManagerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tags: Tag[];
}

export function TagsManagerDialog({
	open,
	onOpenChange,
	tags,
}: TagsManagerDialogProps) {
	const [formOpen, setFormOpen] = useState(false);
	const [editingTag, setEditingTag] = useState<Tag | undefined>();
	const [deletingTag, setDeletingTag] = useState<Tag | undefined>();
	const deleteTag = useDeleteTag();

	function openCreate() {
		setEditingTag(undefined);
		setFormOpen(true);
	}

	function openEdit(tag: Tag) {
		setEditingTag(tag);
		setFormOpen(true);
	}

	async function handleDelete() {
		if (!deletingTag) return;
		try {
			await deleteTag.mutateAsync(deletingTag.id);
			toast.success("Tag deleted");
			setDeletingTag(undefined);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete tag",
			);
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<div className="flex items-center justify-between gap-2">
							<div>
								<DialogTitle>Tags</DialogTitle>
								<p className="text-muted-foreground text-sm">
									Reusable labels for your intel notes.
								</p>
							</div>
							<Button onClick={openCreate}>
								<PlusIcon /> New tag
							</Button>
						</div>
					</DialogHeader>

					{tags.length === 0 && (
						<Card>
							<CardContent className="text-muted-foreground py-10 text-center text-sm">
								No tags yet. Create your first tag to start labeling notes.
							</CardContent>
						</Card>
					)}

					<div className="max-h-[60vh] space-y-2 overflow-y-auto">
						{tags.map((tag) => (
							<Card key={tag.id}>
								<CardContent className="flex items-center justify-between py-3">
									<div className="flex items-center gap-3">
										<span
											className="size-4 shrink-0 rounded-full border"
											style={{ backgroundColor: tag.color }}
										/>
										<span className="font-medium">{tag.name}</span>
										<span className="text-muted-foreground text-xs">
											{tag.color}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => openEdit(tag)}
										>
											<PencilIcon />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeletingTag(tag)}
										>
											<TrashIcon />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<TagFormDialog open={formOpen} onOpenChange={setFormOpen} tag={editingTag} />
			<ConfirmDeleteDialog
				open={!!deletingTag}
				onOpenChange={(o) => !o && setDeletingTag(undefined)}
				title="Delete tag?"
				description={`This will remove "${deletingTag?.name}" from all notes it is attached to.`}
				onConfirm={handleDelete}
				isPending={deleteTag.isPending}
			/>
		</>
	);
}

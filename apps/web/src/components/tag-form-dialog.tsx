import type { CreateTagInput, Tag } from "@repo/api-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorSwatchInput } from "#/components/color-swatch-input";
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
import { useCreateTag, useUpdateTag } from "#/queries/tags";

const DEFAULT_COLOR = "#4FB8B2";

interface TagFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tag?: Tag;
}

export function TagFormDialog({ open, onOpenChange, tag }: TagFormDialogProps) {
	const [name, setName] = useState("");
	const [color, setColor] = useState(DEFAULT_COLOR);
	const createTag = useCreateTag();
	const updateTag = useUpdateTag();

	useEffect(() => {
		if (open) {
			setName(tag?.name ?? "");
			setColor(tag?.color ?? DEFAULT_COLOR);
		}
	}, [open, tag]);

	const isPending = createTag.isPending || updateTag.isPending;
	const isEditing = !!tag;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const input: CreateTagInput = { name: name.trim(), color };
		if (!input.name) return;

		try {
			if (isEditing) {
				await updateTag.mutateAsync({ id: tag.id, input });
				toast.success("Tag updated");
			} else {
				await createTag.mutateAsync(input);
				toast.success("Tag created");
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
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{isEditing ? "Edit tag" : "New tag"}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="tag-name">Name</Label>
							<Input
								id="tag-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="High value target"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="tag-color">Color</Label>
							<ColorSwatchInput
								id="tag-color"
								value={color}
								onChange={setColor}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							{isEditing ? "Save changes" : "Create tag"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

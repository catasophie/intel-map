import type { Bucket, CreateBucketInput } from "@repo/api-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Textarea } from "#/components/ui/textarea";
import { useCreateBucket, useUpdateBucket } from "#/queries/buckets";

interface BucketFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bucket?: Bucket;
}

export function BucketFormDialog({
	open,
	onOpenChange,
	bucket,
}: BucketFormDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const createBucket = useCreateBucket();
	const updateBucket = useUpdateBucket();

	useEffect(() => {
		if (open) {
			setName(bucket?.name ?? "");
			setDescription(bucket?.description ?? "");
		}
	}, [open, bucket]);

	const isPending = createBucket.isPending || updateBucket.isPending;
	const isEditing = !!bucket;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const input: CreateBucketInput = {
			name: name.trim(),
			description: description.trim() || undefined,
		};
		if (!input.name) return;

		try {
			if (isEditing) {
				await updateBucket.mutateAsync({ id: bucket.id, input });
				toast.success("Bucket updated");
			} else {
				await createBucket.mutateAsync(input);
				toast.success("Bucket created");
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
						<DialogTitle>
							{isEditing ? "Edit bucket" : "New bucket"}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="bucket-name">Name</Label>
							<Input
								id="bucket-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Operation Nightfall"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="bucket-description">Description</Label>
							<Textarea
								id="bucket-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Optional context about this bucket"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isPending}>
							{isEditing ? "Save changes" : "Create bucket"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

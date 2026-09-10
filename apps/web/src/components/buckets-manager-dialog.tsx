import type { Bucket } from "@repo/api-types";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BucketCard } from "#/components/bucket-card";
import { BucketFormDialog } from "#/components/bucket-form-dialog";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useDeleteBucket } from "#/queries/buckets";

interface BucketsManagerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	buckets: Bucket[];
	onViewOnMap: (bucketId: string) => void;
}

export function BucketsManagerDialog({
	open,
	onOpenChange,
	buckets,
	onViewOnMap,
}: BucketsManagerDialogProps) {
	const [formOpen, setFormOpen] = useState(false);
	const [editingBucket, setEditingBucket] = useState<Bucket | undefined>();
	const [deletingBucket, setDeletingBucket] = useState<Bucket | undefined>();
	const deleteBucket = useDeleteBucket();

	function openCreate() {
		setEditingBucket(undefined);
		setFormOpen(true);
	}

	function openEdit(bucket: Bucket) {
		setEditingBucket(bucket);
		setFormOpen(true);
	}

	async function handleDelete() {
		if (!deletingBucket) return;
		try {
			await deleteBucket.mutateAsync(deletingBucket.id);
			toast.success("Bucket deleted");
			setDeletingBucket(undefined);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete bucket",
			);
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-3xl">
					<DialogHeader>
						<div className="flex items-center justify-between gap-2">
							<div>
								<DialogTitle>Buckets</DialogTitle>
								<p className="text-muted-foreground text-sm">
									Groups of intel notes shown on the map.
								</p>
							</div>
							<Button onClick={openCreate}>
								<PlusIcon /> New bucket
							</Button>
						</div>
					</DialogHeader>

					{buckets.length === 0 && (
						<Card>
							<CardContent className="text-muted-foreground py-10 text-center text-sm">
								No buckets yet. Create your first bucket to start mapping
								intel notes.
							</CardContent>
						</Card>
					)}

					<div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2">
						{buckets.map((bucket) => (
							<BucketCard
								key={bucket.id}
								bucket={bucket}
								onEdit={() => openEdit(bucket)}
								onDelete={() => setDeletingBucket(bucket)}
								onViewOnMap={() => {
									onViewOnMap(bucket.id);
									onOpenChange(false);
								}}
							/>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<BucketFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				bucket={editingBucket}
			/>
			<ConfirmDeleteDialog
				open={!!deletingBucket}
				onOpenChange={(o) => !o && setDeletingBucket(undefined)}
				title="Delete bucket?"
				description={`This will permanently delete "${deletingBucket?.name}" and all of its notes.`}
				onConfirm={handleDelete}
				isPending={deleteBucket.isPending}
			/>
		</>
	);
}

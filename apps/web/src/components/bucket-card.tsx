import type { Bucket } from "@repo/api-types";
import { MapIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

interface BucketCardProps {
	bucket: Bucket;
	onEdit: () => void;
	onDelete: () => void;
	onViewOnMap: () => void;
}

export function BucketCard({
	bucket,
	onEdit,
	onDelete,
	onViewOnMap,
}: BucketCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{bucket.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-sm">
					{bucket.description || "No description"}
				</p>
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<Button size="sm" onClick={onViewOnMap}>
					<MapIcon /> View on map
				</Button>
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" onClick={onEdit}>
						<PencilIcon />
					</Button>
					<Button variant="ghost" size="icon" onClick={onDelete}>
						<TrashIcon />
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}

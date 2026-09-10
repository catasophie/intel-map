import type { Bucket } from "@repo/api-types";
import { Checkbox } from "#/components/ui/checkbox";

interface BucketTogglePanelProps {
	buckets: Bucket[];
	selectedIds: string[];
	onToggle: (bucketId: string) => void;
}

export function BucketTogglePanel({
	buckets,
	selectedIds,
	onToggle,
}: BucketTogglePanelProps) {
	return (
		<div className="space-y-1">
			<p className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wide">
				Buckets on map
			</p>
			{buckets.map((bucket) => (
				<div
					key={bucket.id}
					className="hover:bg-accent flex items-center gap-2 rounded-md px-1 py-1.5"
				>
					<label
						htmlFor={`bucket-toggle-${bucket.id}`}
						className="flex flex-1 cursor-pointer items-center gap-2 text-sm"
					>
						<Checkbox
							id={`bucket-toggle-${bucket.id}`}
							checked={selectedIds.includes(bucket.id)}
							onCheckedChange={() => onToggle(bucket.id)}
						/>
						<span>{bucket.name}</span>
					</label>
				</div>
			))}
		</div>
	);
}

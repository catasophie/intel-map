import type { Tag } from "@repo/api-types";
import { Badge } from "#/components/ui/badge";

export function TagBadge({ tag }: { tag: Tag }) {
	return (
		<Badge
			variant="outline"
			style={{
				borderColor: tag.color,
				color: tag.color,
				backgroundColor: `${tag.color}1a`,
			}}
		>
			{tag.name}
		</Badge>
	);
}

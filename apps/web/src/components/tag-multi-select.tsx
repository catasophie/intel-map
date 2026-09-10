import type { Tag } from "@repo/api-types";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "#/components/tag-badge";
import { TagFormDialog } from "#/components/tag-form-dialog";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { ScrollArea } from "#/components/ui/scroll-area";

interface TagMultiSelectProps {
	tags: Tag[];
	selectedIds: string[];
	onChange: (ids: string[]) => void;
}

export function TagMultiSelect({
	tags,
	selectedIds,
	onChange,
}: TagMultiSelectProps) {
	const [open, setOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);

	const selectedTags = tags.filter((tag) => selectedIds.includes(tag.id));

	function toggle(id: string) {
		if (selectedIds.includes(id)) {
			onChange(selectedIds.filter((i) => i !== id));
		} else {
			onChange([...selectedIds, id]);
		}
	}

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-1.5">
				{selectedTags.length === 0 && (
					<span className="text-muted-foreground text-sm">No tags</span>
				)}
				{selectedTags.map((tag) => (
					<TagBadge key={tag.id} tag={tag} />
				))}
			</div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="justify-between"
					>
						Select tags
						<ChevronsUpDownIcon className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-56 p-0" align="start">
					<ScrollArea className="max-h-56">
						<div className="p-2">
							{tags.length === 0 && (
								<p className="text-muted-foreground px-2 py-1.5 text-sm">
									No tags yet
								</p>
							)}
							{tags.map((tag) => (
								<label
									key={tag.id}
									htmlFor={`tag-multi-select-${tag.id}`}
									className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
								>
									<Checkbox
										id={`tag-multi-select-${tag.id}`}
										checked={selectedIds.includes(tag.id)}
										onCheckedChange={() => toggle(tag.id)}
									/>
									<span
										className="size-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: tag.color }}
									/>
									{tag.name}
								</label>
							))}
						</div>
					</ScrollArea>
					<div className="border-t p-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="w-full justify-start"
							onClick={() => setCreateOpen(true)}
						>
							<PlusIcon /> New tag
						</Button>
					</div>
				</PopoverContent>
			</Popover>
			<TagFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}

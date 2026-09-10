import type { IntelNote } from "@repo/api-types";
import { cn } from "#/lib/utils";

interface NotesListPanelProps {
	notes: IntelNote[];
	activeNoteId?: string;
	onSelect: (note: IntelNote) => void;
}

export function NotesListPanel({
	notes,
	activeNoteId,
	onSelect,
}: NotesListPanelProps) {
	return (
		<div className="space-y-1">
			<p className="text-muted-foreground px-1 text-xs font-medium uppercase tracking-wide">
				Notes on map
			</p>
			{notes.length === 0 ? (
				<p className="text-muted-foreground px-1 text-sm">
					No notes to show.
				</p>
			) : (
				<ul className="space-y-1">
					{notes.map((note) => {
						const color = note.tags?.[0]?.color ?? "#5b6b73";
						return (
							<li key={note.id}>
								<button
									type="button"
									onClick={() => onSelect(note)}
									className={cn(
										"hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
										activeNoteId === note.id && "bg-accent",
									)}
								>
									<span
										className="size-2.5 shrink-0 rounded-full border border-white shadow"
										style={{ backgroundColor: color }}
									/>
									<span className="truncate">{note.title}</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

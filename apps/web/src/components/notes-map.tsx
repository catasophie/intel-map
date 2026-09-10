import type { IntelNote } from "@repo/api-types";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapMouseEvent, MapRef } from "react-map-gl/maplibre";
import MapGl, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

const MAP_STYLE_URL =
	import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL;

if (!import.meta.env.VITE_MAP_STYLE_URL) {
	console.warn(
		"VITE_MAP_STYLE_URL is not set — falling back to the public MapLibre demo style. " +
			"Set VITE_MAP_STYLE_URL in apps/web/.env.local to point at your own tile server's style.json.",
	);
}

const DEFAULT_MARKER_COLOR = "#5b6b73";

interface NotesMapProps {
	notes: IntelNote[];
	placingNote: boolean;
	onMapClick: (coords: { lat: number; lng: number }) => void;
	onMarkerDragEnd: (
		noteId: string,
		coords: { lat: number; lng: number },
	) => void;
	onEditNote: (note: IntelNote) => void;
	onDeleteNote: (note: IntelNote) => void;
	focusRequest?: { noteId: string; nonce: number };
}

export function NotesMap({
	notes,
	placingNote,
	onMapClick,
	onMarkerDragEnd,
	onEditNote,
	onDeleteNote,
	focusRequest,
}: NotesMapProps) {
	const mapRef = useRef<MapRef>(null);
	const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

	const handleClick = useCallback(
		(e: MapMouseEvent) => {
			if (!placingNote) return;
			onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
		},
		[placingNote, onMapClick],
	);

	const handleContextMenu = useCallback(
		(e: MapMouseEvent) => {
			e.originalEvent.preventDefault();
			onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
		},
		[onMapClick],
	);

	const activeNote = notes.find((n) => n.id === activeNoteId);

	useEffect(() => {
		if (!focusRequest) return;
		const note = notes.find((n) => n.id === focusRequest.noteId);
		if (!note) return;
		setActiveNoteId(note.id);
		mapRef.current?.flyTo({
			center: [note.lng, note.lat],
			zoom: Math.max(mapRef.current.getZoom(), 12),
			duration: 800,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [focusRequest]);

	const initialCenter = notes[0]
		? { longitude: notes[0].lng, latitude: notes[0].lat }
		: { longitude: 0, latitude: 20 };

	return (
		<MapGl
			ref={mapRef}
			mapStyle={MAP_STYLE_URL}
			initialViewState={{ ...initialCenter, zoom: notes[0] ? 10 : 1.5 }}
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			cursor={placingNote ? "crosshair" : undefined}
			style={{ width: "100%", height: "100%" }}
		>
			<NavigationControl position="top-right" />
			{notes.map((note) => {
				const color = note.tags?.[0]?.color ?? DEFAULT_MARKER_COLOR;
				return (
					<Marker
						key={note.id}
						longitude={note.lng}
						latitude={note.lat}
						draggable
						onDragEnd={(e) =>
							onMarkerDragEnd(note.id, {
								lat: e.lngLat.lat,
								lng: e.lngLat.lng,
							})
						}
						onClick={(e) => {
							e.originalEvent.stopPropagation();
							setActiveNoteId(note.id);
						}}
					>
						<div
							className="size-4 cursor-pointer rounded-full border-2 border-white shadow"
							style={{ backgroundColor: color }}
						/>
					</Marker>
				);
			})}

			{activeNote && (
				<Popup
					longitude={activeNote.lng}
					latitude={activeNote.lat}
					onClose={() => setActiveNoteId(null)}
					closeOnClick={false}
					anchor="bottom"
					offset={12}
				>
					<div className="min-w-48 space-y-2">
						<p className="font-semibold">{activeNote.title}</p>
						{activeNote.description && (
							<p className="text-muted-foreground line-clamp-3 text-xs">
								{activeNote.description}
							</p>
						)}
						<div className="flex flex-wrap gap-1">
							{activeNote.tags?.map((tag) => (
								<span
									key={tag.id}
									className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
									style={{
										backgroundColor: `${tag.color}22`,
										color: tag.color,
									}}
								>
									{tag.name}
								</span>
							))}
						</div>
						<div className="flex gap-2 pt-1">
							<button
								type="button"
								className="text-xs font-medium text-sky-600 hover:underline"
								onClick={() => onEditNote(activeNote)}
							>
								Edit
							</button>
							<button
								type="button"
								className="text-xs font-medium text-red-600 hover:underline"
								onClick={() => {
									onDeleteNote(activeNote);
									setActiveNoteId(null);
								}}
							>
								Delete
							</button>
						</div>
					</div>
				</Popup>
			)}
		</MapGl>
	);
}

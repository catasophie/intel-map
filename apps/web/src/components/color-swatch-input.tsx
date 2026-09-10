import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

interface ColorSwatchInputProps {
	id?: string;
	value: string;
	onChange: (value: string) => void;
}

export function ColorSwatchInput({
	id,
	value,
	onChange,
}: ColorSwatchInputProps) {
	const isValid = /^#[0-9A-Fa-f]{6}$/.test(value);

	return (
		<div className="flex items-center gap-2">
			<div className="relative shrink-0">
				<input
					type="color"
					aria-label="Pick a color"
					value={isValid ? value : "#888888"}
					onChange={(e) => onChange(e.target.value.toUpperCase())}
					className="size-9 cursor-pointer appearance-none rounded-md border border-input bg-transparent p-0"
				/>
			</div>
			<div className="flex-1">
				<Label htmlFor={id} className="sr-only">
					Color hex value
				</Label>
				<Input
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value.toUpperCase())}
					placeholder="#4FB8B2"
					maxLength={7}
				/>
			</div>
		</div>
	);
}

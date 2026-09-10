import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { cn } from "#/lib/utils";

interface RichTextEditorProps {
	value: string;
	onChange: (markdown: string) => void;
	placeholder?: string;
	className?: string;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder,
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Markdown.configure({
				html: false,
				transformPastedText: true,
			}),
		],
		content: value,
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm max-w-none min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring",
					className,
				),
				"data-placeholder": placeholder ?? "",
			},
		},
		onUpdate: ({ editor: currentEditor }) => {
			const storage = currentEditor.storage as unknown as {
				markdown: { getMarkdown: () => string };
			};
			onChange(storage.markdown.getMarkdown());
		},
		immediatelyRender: false,
	});

	return <EditorContent editor={editor} />;
}

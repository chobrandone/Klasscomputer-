'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Italic, List, ListOrdered } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value (e.g. when editing an existing product loads)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="input-klass min-h-[200px] animate-pulse" />;
  }

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
  ];

  return (
    <div className="tiptap-editor overflow-hidden rounded border border-[#E0E0E0] dark:border-[#2A2A2A]">
      <div className="flex gap-1 border-b border-[#E0E0E0] bg-[#F5F5F5] p-2 dark:border-[#2A2A2A] dark:bg-[#141414]">
        {buttons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            className={cn(
              'rounded p-1.5 transition-colors',
              btn.active
                ? 'bg-brand text-white'
                : 'text-[#555555] hover:bg-[#E0E0E0] dark:text-[#999999] dark:hover:bg-[#2A2A2A]',
            )}
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="prose-klass bg-white text-sm dark:bg-[#1A1A1A]" />
      {editor.isEmpty && placeholder && (
        <p className="pointer-events-none -mt-[210px] mb-[186px] px-4 text-sm text-[#999999]">
          {placeholder}
        </p>
      )}
    </div>
  );
}

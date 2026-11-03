'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Code
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  // Synchronize editor content if external value changes (e.g. editing different entry or reset)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const getButtonClass = (isActive: boolean) =>
    cn(
      'p-1.5 sm:p-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center shrink-0 cursor-pointer',
      isActive
        ? 'bg-neutral-900 text-white shadow-xs'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70 bg-transparent'
    )

  return (
    <div className={cn('space-y-1.5 flex flex-col w-full min-w-0', className)}>
      <div className="border border-neutral-300 rounded-xl overflow-hidden bg-white shadow-xs focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 transition-all flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 sm:p-2 bg-neutral-50/90 border-b border-neutral-200">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-200 mx-0.5" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getButtonClass(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getButtonClass(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-200 mx-0.5" />

          {/* Ordered and Bullet Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={getButtonClass(editor.isActive('orderedList'))}
            title="Numbered / Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getButtonClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getButtonClass(editor.isActive('blockquote'))}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={getButtonClass(editor.isActive('codeBlock'))}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-200 mx-0.5 ml-auto hidden sm:block" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={cn(getButtonClass(false), 'disabled:opacity-30 disabled:pointer-events-none')}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={cn(getButtonClass(false), 'disabled:opacity-30 disabled:pointer-events-none')}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Area */}
        <EditorContent
          editor={editor}
          className="tiptap-content p-3 sm:p-4 text-sm text-neutral-900 min-h-[140px] sm:min-h-[170px] max-h-[320px] overflow-y-auto w-full min-w-0"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400">
        <span>Tip: Use the toolbar buttons above to format headings, numbered lists, and bold text</span>
      </div>
    </div>
  )
}

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo2,
  Redo2
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
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const buttonClass = "p-2 hover:bg-secondary rounded transition-colors"
  const activeClass = "bg-secondary text-primary"

  return (
    <div className={cn("space-y-2 flex flex-col", className)}>
      <div className="border border-input rounded-lg overflow-hidden bg-background flex flex-col flex-1">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-secondary/20 border-b border-input">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={buttonClass}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={buttonClass}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>

          <div className="w-px bg-border" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={buttonClass}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={buttonClass}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px bg-border" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClass}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={buttonClass}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </Button>

          <div className="w-px bg-border" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            className={buttonClass}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            className={buttonClass}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="rich-text-editor prose prose-invert max-w-none flex-1 overflow-y-auto min-h-[300px]"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Supports formatting, lists, headings, and paste from Word with formatting preserved
      </p>
    </div>
  )
}

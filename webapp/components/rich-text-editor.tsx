"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import Link from "@tiptap/extension-link"
import { useCallback, useState } from "react"
import { EditorToolbar } from "./editor-toolbar"
import { InternalLinkModal } from "./internal-link-modal"
import { cn } from "@/lib/utils"
import { TableInsertionModal } from "./table-insertion-modal"

interface RichTextEditorProps {
  value: JSONContent | string // Accept JSON or HTML for backward compatibility
  onChange: (json: JSONContent) => void // Always emit JSON for chapters
  className?: string
  editable?: boolean
}

export function RichTextEditor({ value, onChange, className, editable = true }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON()) // Always emit JSON
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
  })

  const addInternalLink = useCallback(
    (url: string, text: string) => {
      if (editor) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).insertContent(text).run()
      }
    },
    [editor],
  )

  const insertTable = useCallback(
    (rows: number, cols: number, withHeaderRow: boolean) => {
      if (editor) {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
      }
    },
    [editor],
  )

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-lg", className)}>
      <EditorToolbar
        editor={editor}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        onOpenTableModal={() => setIsTableModalOpen(true)}
      />
      <div className="border-t">
        <EditorContent editor={editor} />
      </div>

      <InternalLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAddLink={addInternalLink}
      />

      <TableInsertionModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsertTable={insertTable}
      />
    </div>
  )
}

"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import Link from "@tiptap/extension-link"
import { cn } from "@/lib/utils"

interface TipTapRendererProps {
  content: JSONContent | null | undefined | any[] | any
  className?: string
  showEmptyState?: boolean
  contentIndex?: number // For array content, specify which index to render
}

export function TipTapRenderer({ content, className, showEmptyState = true, contentIndex = 0 }: TipTapRendererProps) {
  // Handle different content formats
  let tipTapContent: JSONContent | null = null

  if (Array.isArray(content)) {
    // Content is an array, get the specified index or first element
    const targetContent = content[contentIndex] || content[0]
    tipTapContent = targetContent || null
  } else if (content && typeof content === 'object') {
    // Content is already a TipTap JSON object
    tipTapContent = content
  } else {
    // Content is null, undefined, or invalid
    tipTapContent = null
  }

  const editor = useEditor({
    extensions: (() => {
      const base = [StarterKit];
      const canConfigureTable = (Table as any)?.configure;
      if (canConfigureTable) {
        base.push(
          (Table as any).configure({ resizable: true }),
          TableRow as any,
          TableHeader as any,
          TableCell as any,
        );
      }
      base.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors" },
        }) as any,
      );
      return base as any[];
    })(),
    content: tipTapContent || { type: 'doc', content: [] },
    editable: false, // Read-only for rendering
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  // Handle empty or invalid content
  if (!tipTapContent || (typeof tipTapContent === 'object' && (!tipTapContent.content || tipTapContent.content.length === 0))) {
    if (!showEmptyState) {
      return null
    }
    return (
      <div className={cn("text-gray-500 text-center py-8", className)}>
        <p>No content available.</p>
      </div>
    )
  }

  return (
    <div className={cn("tiptap-renderer", className)}>
      <EditorContent editor={editor} />
    </div>
  )
} 
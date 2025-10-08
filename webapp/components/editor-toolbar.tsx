"use client"

import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Table,
  Link,
  ExternalLink,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorToolbarProps {
  editor: Editor
  onOpenLinkModal: () => void
  onOpenTableModal: () => void
}

export function EditorToolbar({ editor, onOpenLinkModal, onOpenTableModal }: EditorToolbarProps) {
  const addExternalLink = () => {
    const url = window.prompt("Enter URL:")
    const text = window.prompt("Enter link text:")

    if (url && text) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).insertContent(text).run()
    }
  }

  const previewHtml = () => {
    const html = editor.getHTML()
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(`<!DOCTYPE html><html><head><title>Preview</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.2/dist/typography.min.css"></head><body class="prose mx-auto p-4">${html}</body></html>`)
      previewWindow.document.close()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(editor.isActive("bold") && "bg-muted")}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(editor.isActive("italic") && "bg-muted")}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(editor.isActive("strike") && "bg-muted")}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(editor.isActive("code") && "bg-muted")}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(editor.isActive("bulletList") && "bg-muted")}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(editor.isActive("orderedList") && "bg-muted")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(editor.isActive("blockquote") && "bg-muted")}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Table */}
      <Button variant="ghost" size="sm" onClick={onOpenTableModal} title="Insert Table">
        <Table className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Links */}
      <Button variant="ghost" size="sm" onClick={addExternalLink} title="Add External Link">
        <ExternalLink className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={onOpenLinkModal} title="Add Internal Link">
        <Link className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Preview */}
      <Button variant="ghost" size="sm" onClick={previewHtml} title="Preview HTML in new tab">
        <Eye className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

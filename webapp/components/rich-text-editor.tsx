"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import Link from "@tiptap/extension-link"
import { useCallback, useState, useEffect } from "react"
import { EditorToolbar } from "./editor-toolbar"
import { InternalLinkModal } from "./internal-link-modal"
import { cn } from "@/lib/utils"
import { TableInsertionModal } from "./table-insertion-modal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, X } from "lucide-react"

interface RichTextEditorProps {
  value: string | JSONContent // accept HTML string (preferred) or legacy JSON
  onChange: (html: string) => void // emit HTML string
  className?: string
  editable?: boolean
}

export function RichTextEditor({ value, onChange, className, editable = true }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false)
  const [rawHtmlValue, setRawHtmlValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const editor = useEditor({
    extensions: (() => {
      const base = [StarterKit];
      // Conditionally add table extensions if available to prevent runtime errors
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
          HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
        }) as any,
      );
      return base as any[];
    })(),
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      if (!isRawHtmlMode) {
        onChange(editor.getHTML()) // emit HTML string
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-lg lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
    immediatelyRender: false,
  })

  // Sync raw HTML value when switching modes or when value prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      setRawHtmlValue(value)
    } else if (editor) {
      setRawHtmlValue(editor.getHTML())
    }
  }, [value, editor])

  // Handle raw HTML changes
  const handleRawHtmlChange = (html: string) => {
    setRawHtmlValue(html)
    onChange(html)
  }

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setIsRawHtmlMode(checked)
    if (checked && editor) {
      // Switching to raw HTML mode - update raw HTML value
      setRawHtmlValue(editor.getHTML())
    } else if (!checked && editor) {
      // Switching to editor mode - update editor content
      editor.commands.setContent(rawHtmlValue)
    }
  }

  // Handle expand/minimize
  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleMinimize = () => {
    setIsExpanded(false)
  }

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

  // Expanded full-screen view
  if (isExpanded) {
    return (
      <div className="absolute inset-0 z-50 bg-white w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 h-16">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Rich Text Editor</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-mode-expanded"
                checked={isRawHtmlMode}
                onCheckedChange={handleModeToggle}
                disabled={!editable}
              />
              <Label htmlFor="edit-mode-expanded" className="text-sm font-medium">
                {isRawHtmlMode ? "Raw HTML Mode" : "Visual Editor Mode"}
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMinimize}
              className="flex items-center space-x-2"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Minimize</span>
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        {!isRawHtmlMode && (
          <div className="border-b p-2 h-12">
            <EditorToolbar
              editor={editor}
              onOpenLinkModal={() => setIsLinkModalOpen(true)}
              onOpenTableModal={() => setIsTableModalOpen(true)}
            />
          </div>
        )}

        {/* Content Area - Full Screen */}
        <div className="h-[calc(100%-4rem)] overflow-auto">
          {isRawHtmlMode ? (
            <textarea
              value={rawHtmlValue}
              onChange={(e) => handleRawHtmlChange(e.target.value)}
              className="w-full h-full p-6 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter HTML content here..."
              disabled={!editable}
            />
          ) : (
            <div className="h-full p-6">
              <EditorContent editor={editor} />
            </div>
          )}
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

  // Compact view
  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Mode Toggle and Expand Button */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-mode"
            checked={isRawHtmlMode}
            onCheckedChange={handleModeToggle}
            disabled={!editable}
          />
          <Label htmlFor="edit-mode" className="text-sm font-medium">
            {isRawHtmlMode ? "Raw HTML Mode" : "Visual Editor Mode"}
          </Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpand}
          className="flex items-center space-x-2"
        >
          <Maximize2 className="h-4 w-4" />
          <span>Expand</span>
        </Button>
      </div>

      {/* Editor Toolbar */}
      {!isRawHtmlMode && (
        <div className="border-b">
          <EditorToolbar
            editor={editor}
            onOpenLinkModal={() => setIsLinkModalOpen(true)}
            onOpenTableModal={() => setIsTableModalOpen(true)}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="border-t">
        {isRawHtmlMode ? (
          <textarea
            value={rawHtmlValue}
            onChange={(e) => handleRawHtmlChange(e.target.value)}
            className="w-full min-h-[300px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter HTML content here..."
            disabled={!editable}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
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

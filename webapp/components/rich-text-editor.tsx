"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Link from "@tiptap/extension-link";
import { useCallback, useState, useEffect } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { InternalLinkModal } from "./internal-link-modal";
import { TableInsertionModal } from "./table-insertion-modal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string | JSONContent;
  onChange: (html: string) => void;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({ value, onChange, className, editable = true }: RichTextEditorProps) {
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);
  const [rawHtmlValue, setRawHtmlValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const editor = useEditor({
    extensions: (() => {
      const base = [StarterKit];

      if ((Table as any)?.configure) {
        base.push(
          (Table as any).configure({ resizable: true }),
          TableRow as any,
          TableHeader as any,
          TableCell as any
        );
      }

      base.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
        }) as any
      );

      return base;
    })(),
    editable,
    onUpdate: ({ editor }) => {
      if (!isRawHtmlMode) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
    immediatelyRender: false,
  });

  /** 🔥 CRITICAL — Sync `value` → editor whenever it changes */
  useEffect(() => {
    if (!editor) return;
    if (isRawHtmlMode) return;

    if (typeof value === "string") {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    } else {
      editor.commands.setContent(value);
    }
  }, [value, editor, isRawHtmlMode]);

  /** Keep raw HTML panel synced */
  useEffect(() => {
    if (typeof value === "string") {
      setRawHtmlValue(value);
    } else if (editor) {
      setRawHtmlValue(editor.getHTML());
    }
  }, [value, editor]);

  const handleRawHtmlChange = (html: string) => {
    setRawHtmlValue(html);
    onChange(html);
  };

  /** Toggle visual/raw mode */
  const handleModeToggle = (checked: boolean) => {
    setIsRawHtmlMode(checked);

    if (checked && editor) {
      setRawHtmlValue(editor.getHTML());
    } else if (!checked && editor) {
      editor.commands.setContent(rawHtmlValue);
    }
  };

  const insertTable = useCallback(
    (rows: number, cols: number, withHeaderRow: boolean) => {
      editor?.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    },
    [editor]
  );

  const addInternalLink = useCallback(
    (url: string, text: string) => {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).insertContent(text).run();
    },
    [editor]
  );

  if (!editor) return null;

  /** ========== EXPANDED MODE ========== */
  if (isExpanded) {
    return (
      <div className="absolute inset-0 z-50 bg-white w-full h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRawHtmlMode}
              onCheckedChange={handleModeToggle}
              disabled={!editable}
            />
            <Label>{isRawHtmlMode ? "Raw HTML Mode" : "Visual Editor Mode"}</Label>
          </div>

          <Button onClick={() => setIsExpanded(false)}>
            <Minimize2 className="h-4 w-4 mr-1" /> Minimize
          </Button>
        </div>

        {!isRawHtmlMode && (
          <div className="border-b p-2">
            <EditorToolbar editor={editor} onOpenLinkModal={() => setIsLinkModalOpen(true)} onOpenTableModal={() => setIsTableModalOpen(true)} />
          </div>
        )}

        <div className="p-4 overflow-auto h-[calc(100%-120px)]">
          {isRawHtmlMode ? (
            <textarea
              className="w-full h-full p-4 font-mono text-sm border rounded"
              onChange={(e) => handleRawHtmlChange(e.target.value)}
              value={rawHtmlValue}
            />
          ) : (
            <EditorContent editor={editor} className="min-h-[400px] p-4 border rounded" />
          )}
        </div>
      </div>
    );
  }

  /** ========== NORMAL COMPACT MODE ========== */
  return (
    <div className={cn("border rounded-lg", className)}>
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Switch checked={isRawHtmlMode} onCheckedChange={handleModeToggle} />
          <Label>{isRawHtmlMode ? "Raw HTML Mode" : "Visual Editor Mode"}</Label>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)}>
          <Maximize2 className="h-4 w-4 mr-1" /> Expand
        </Button>
      </div>

      {!isRawHtmlMode && (
        <div className="border-b">
          <EditorToolbar editor={editor} onOpenLinkModal={() => setIsLinkModalOpen(true)} onOpenTableModal={() => setIsTableModalOpen(true)} />
        </div>
      )}

      <div className="border-t">
        {isRawHtmlMode ? (
          <textarea
            className="w-full min-h-[300px] p-4 font-mono text-sm border-0 focus:outline-none resize-none"
            value={rawHtmlValue}
            onChange={(e) => handleRawHtmlChange(e.target.value)}
          />
        ) : (
          <EditorContent editor={editor} className="min-h-[300px] p-4" />
        )}
      </div>

      <InternalLinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onAddLink={addInternalLink} />

      <TableInsertionModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsertTable={insertTable} />
    </div>
  );
}

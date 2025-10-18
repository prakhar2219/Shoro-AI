import { ColumnDef } from "@tanstack/react-table";
import { ITopic } from "@/lib/api/entities/topics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export const topicColumns: ColumnDef<ITopic>[] = [
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false);
      const id = row.getValue("_id") as string;

      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(id);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {id?.substring(0, 8)}...
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    }
  },
  {
    accessorKey: "order",
    header: "Order",
    cell: info => info.getValue(),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: info => info.getValue(),
  },
  {
    accessorKey: "board_id",
    header: "Board",
    cell: ({ row }) => {
      const chapter = row.original.chapter_id as any;
      const board = chapter?.subject_id?.class_id?.board_id;
      if (board && typeof board === "object" && "name" in board) {
        return <span>{board.name}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "class_id",
    header: "Class",
    cell: ({ row }) => {
      const chapter = row.original.chapter_id as any;
      const classs = chapter?.subject_id?.class_id;
      if (classs && typeof classs === "object" && "name" in classs) {
        return <span>{classs.name}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "subject_id",
    header: "Subject",
    cell: ({ row }) => {
      const chapter = row.original.chapter_id as any;
      const subject = chapter?.subject_id;
      if (subject && typeof subject === "object" && "name" in subject) {
        return <span>{subject.name}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "chapter_id",
    header: "Chapter",
    cell: ({ row }) => {
      const chapter = row.original.chapter_id as any;
      if (chapter && typeof chapter === 'object' && 'title' in chapter) {
        return <span>{chapter.title}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    }
  },
  {
    accessorKey: "language_id",
    header: "Language",
    cell: ({ row }) => {
      const language = row.original.language_id;
      if (language && typeof language === 'object' && 'name' in language) {
        return <span>{language.name} ({language.code})</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.getValue("author") as string;
      return author || <span className="text-zinc-400 italic">N/A</span>;
    },
  },
  {
    accessorKey: "tag",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tag") as string[];
      if (!tags || tags.length === 0) {
        return <span className="text-zinc-400 italic">No tags</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_published",
    header: "Published",
    cell: info => (info.getValue() ? "Yes" : "No"),
  },
];



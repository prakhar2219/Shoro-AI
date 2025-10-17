import { ColumnDef } from "@tanstack/react-table";
import { ISubtopic } from "@/lib/api/entities/subtopics";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export const subtopicColumns: ColumnDef<ISubtopic>[] = [
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
      const topic = row.original.topic_id as any;
      const board = topic?.chapter_id?.subject_id?.class_id?.board_id;
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
      const topic = row.original.topic_id as any;
      const classs = topic?.chapter_id?.subject_id?.class_id;
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
      const topic = row.original.topic_id as any;
      const subject = topic?.chapter_id?.subject_id;
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
      const topic = row.original.topic_id as any;
      const chapter = topic?.chapter_id;
      if (chapter && typeof chapter === "object" && "title" in chapter) {
        return <span>{chapter.title}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "topic_id",
    header: "Topic",
    cell: ({ row }) => {
      const topic = row.original.topic_id as any;
      if (topic && typeof topic === 'object' && 'title' in topic) {
        return <span>{topic.title}</span>;
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
    accessorKey: "is_published",
    header: "Published",
    cell: info => (info.getValue() ? "Yes" : "No"),
  },
];






import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export interface IGBQuestion {
  _id: string;
  gb_subtopic_id: any;
  question: string;
  slug: string;
  answer?: string;
  content?: string;
  language_id: any;
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_published: boolean;
  created_by?: any;
  createdAt: string;
  updatedAt: string;
}

export const gbQuestionColumns: ColumnDef<IGBQuestion>[] = [
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
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => {
      const question = row.getValue("question") as string;
      const slug = row.original.slug;
      return (
        <div>
          <div className="font-medium line-clamp-2">{question}</div>
          <div className="text-sm text-gray-500">{slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "gb_subtopic_id",
    header: "Subtopic",
    cell: ({ row }) => {
      const subtopic = row.original.gb_subtopic_id;
      if (subtopic && typeof subtopic === "object" && "name" in subtopic) {
        return <span className="font-medium">{subtopic.name}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "language_id",
    header: "Language",
    cell: ({ row }) => {
      const language = row.original.language_id;
      if (language && typeof language === "object" && "name" in language) {
        return (
          <div>
            <span className="font-medium">{language.name}</span>
            <div className="text-xs text-gray-500">({language.code})</div>
          </div>
        );
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
  },
  {
    accessorKey: "difficulty_level",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty_level") as string;
      const colorMap = {
        easy: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800", 
        hard: "bg-red-100 text-red-800"
      };
      return (
        <Badge className={colorMap[difficulty as keyof typeof colorMap] || "bg-gray-100 text-gray-800"}>
          {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
        </Badge>
      );
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
    cell: ({ row }) => {
      const isPublished = row.getValue("is_published") as boolean;
      return (
        <Badge variant={isPublished ? "default" : "secondary"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
];

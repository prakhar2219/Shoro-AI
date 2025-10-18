import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export interface IGBSubtopic {
  _id: string;
  gb_topic_id: any;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  language_id: any;
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  is_published: boolean;
  created_by?: any;
  createdAt: string;
  updatedAt: string;
}

export const gbSubtopicColumns: ColumnDef<IGBSubtopic>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const slug = row.original.slug;
      return (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "gb_topic_id",
    header: "Topic",
    cell: ({ row }) => {
      const topic = row.original.gb_topic_id;
      if (topic && typeof topic === "object" && "name" in topic) {
        return <span className="font-medium">{topic.name}</span>;
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

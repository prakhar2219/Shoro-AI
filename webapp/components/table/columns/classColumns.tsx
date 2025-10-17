import { ColumnDef } from "@tanstack/react-table";
import { IClass } from "@/lib/api/entities/classes";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export const classColumns: ColumnDef<IClass>[] = [
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
  { accessorKey: "name", header: "Name" },
  { accessorKey: "grade", header: "Grade" },
  {
    accessorKey: "board_id",
    header: "Board",
    cell: ({ row }) => {
      const board = row.original.board_id;
      if (board && typeof board === 'object' && 'name' in board) {
        return <span>{board.name}</span>;
      }
      return <span className="text-zinc-400 italic">Unknown</span>;
    },
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
]; 
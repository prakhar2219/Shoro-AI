import { ColumnDef } from "@tanstack/react-table";
import { IBoard } from "@/lib/api/entities/boards";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";

export const boardColumns: ColumnDef<IBoard>[] = [
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
  { accessorKey: "short_code", header: "Short Code" },
  { accessorKey: "country_name", header: "Country" },
]; 
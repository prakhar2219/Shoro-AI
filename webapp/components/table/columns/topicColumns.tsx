import { ColumnDef } from "@tanstack/react-table";
import { ITopic } from "@/lib/api/entities/topics";

export const topicColumns: ColumnDef<ITopic>[] = [
  { accessorKey: "_id", header: "ID" },
  { accessorKey: "order", header: "Order" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "chapter_id",
    header: "Chapter",
    cell: ({ row }) => {
      const ch = row.original.chapter_id as any;
      return ch && typeof ch === 'object' && 'title' in ch ? ch.title : '—';
    }
  },
  { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
];



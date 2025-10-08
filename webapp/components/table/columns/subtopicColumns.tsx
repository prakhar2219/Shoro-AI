import { ColumnDef } from "@tanstack/react-table";
import { ISubtopic } from "@/lib/api/entities/subtopics";

export const subtopicColumns: ColumnDef<ISubtopic>[] = [
  { accessorKey: "_id", header: "ID" },
  { accessorKey: "order", header: "Order" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "topic_id",
    header: "Topic",
    cell: ({ row }) => {
      const t = row.original.topic_id as any;
      return t && typeof t === 'object' && 'title' in t ? t.title : '—';
    }
  },
  { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
];






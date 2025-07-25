import { ColumnDef } from "@tanstack/react-table";
import { ISubject } from "@/lib/api/entities/subjects";

export const subjectColumns: ColumnDef<ISubject>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => row.original.code,
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => row.original.icon || '-',
  },
  {
    accessorKey: "board",
    header: "Board",
    cell: ({ row }) => {
      const classObj = row.original.class_id;
      if (typeof classObj === 'object' && classObj !== null && 'board_id' in classObj) {
        const board = classObj.board_id;
        if (typeof board === 'object' && board !== null) {
          return board.name || '-';
        }
        return board || '-';
      }
      return '-';
    },
  },
  {
    accessorKey: "class_id",
    header: "Class",
    cell: ({ row }) => {
      const cls = row.original.class_id;
      if (typeof cls === 'object' && cls !== null) {
        return cls.name || '';
      }
      return cls || '';
    },
  },
  {
    accessorKey: "translation",
    header: "Translation",
    cell: ({ row }) => row.original.translation?.name || '-',
  },
]; 
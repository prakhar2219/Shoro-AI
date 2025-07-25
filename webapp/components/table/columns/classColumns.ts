import { ColumnDef } from "@tanstack/react-table";
import { IClass } from "@/lib/api/entities/classes";

export const classColumns: ColumnDef<IClass>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => row.original.grade,
  },
  {
    accessorKey: "board_id",
    header: "Board",
    cell: ({ row }) => {
      const board = row.original.board_id;
      if (typeof board === 'object' && board !== null) {
        return board.name || board.short_code || '';
      }
      return board || '';
    },
  },
  {
    accessorKey: "translation",
    header: "Translation",
    cell: ({ row }) => row.original.translation?.name || '-',
  },
]; 
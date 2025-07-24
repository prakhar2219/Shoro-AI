import { ColumnDef } from "@tanstack/react-table";

export const chapterColumns: ColumnDef<any>[] = [
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
    cell: info => info.row.original.board_id?.name || info.row.original.board_id || "-",
  },
  {
    accessorKey: "class_id",
    header: "Class",
    cell: info => info.row.original.class_id?.name || info.row.original.class_id || "-",
  },
  {
    accessorKey: "subject_id",
    header: "Subject",
    cell: info => info.row.original.subject_id?.name || info.row.original.subject_id || "-",
  },
  {
    accessorKey: "is_published",
    header: "Published",
    cell: info => (info.getValue() ? "Yes" : "No"),
  },
]; 
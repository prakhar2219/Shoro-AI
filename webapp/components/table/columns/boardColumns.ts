import { ColumnDef } from "@tanstack/react-table";
import { IBoard } from "@/lib/api/entities/boards";

export const boardColumns: ColumnDef<IBoard>[] = [
  {
    accessorKey: "short_code",
    header: "Short Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "country_id",
    header: "Country",
    cell: ({ row }) => {
      const country = row.original.country_id;
      if (typeof country === 'object' && country !== null) {
        const c = country as any;
        return c.name || c.code || '';
      }
      return country || '';
    },
  },
  {
    accessorKey: "default_language_id",
    header: "Default Language",
    cell: ({ row }) => {
      const lang = row.original.default_language_id;
      if (typeof lang === 'object' && lang !== null) {
        const l = lang as any;
        return l.name || l.code || '';
      }
      return lang || '';
    },
  },
  {
    accessorKey: "supported_language_ids",
    header: "Supported Languages",
    cell: ({ row }) => {
      const langs = row.original.supported_language_ids;
      if (Array.isArray(langs)) {
        return langs
          .map((l: any) => (typeof l === 'object' && l !== null ? (l as any).name || (l as any).code : l))
          .join(', ') || '-';
      }
      return '-';
    },
  },
]; 
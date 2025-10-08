import { ColumnDef } from "@tanstack/react-table";
import { ILanguage } from "@/lib/api/entities/language";

export const languageColumns: ColumnDef<ILanguage>[] = [
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "native_name", header: "Native Name" },
  { accessorKey: "direction", header: "Direction" },
  { accessorKey: "locale", header: "Locale" },
  { accessorKey: "script", header: "Script" },
  { accessorKey: "ai_supported", header: "AI Supported" },
]; 
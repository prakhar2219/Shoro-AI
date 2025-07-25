import { ColumnDef } from "@tanstack/react-table";
import { ICountry } from "@/lib/api/entities/countries";

export const countryColumns: ColumnDef<ICountry>[] = [
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "default_language_code", header: "Default Language" },
  { accessorKey: "supported_language_codes", header: "Supported Languages" },
]; 
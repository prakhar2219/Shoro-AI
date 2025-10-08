import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  page?: number;
  setPage?: (page: number) => void;
  totalPages?: number;
  renderExpandedRow?: (row: TData) => React.ReactNode; // NEW
}

export function DataTable<TData, TValue>({ columns, data, pageSize = 10, page = 0, setPage, totalPages = 1, renderExpandedRow }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null); // NEW

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // No internal pagination; data is already paginated from backend
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto border rounded-lg bg-white dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {renderExpandedRow && (
                <th className="w-8"></th> // Expand column
              )}
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider cursor-pointer select-none"
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <span className="ml-1">
                      {header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : ""}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderExpandedRow ? 1 : 0)} className="px-4 py-6 text-center text-zinc-400 dark:text-zinc-500">
                No data found.
              </td>
            </tr>
          ) : (
            rows.map(row => {
              const isExpanded = expandedRowId === row.id;
              return (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                    {renderExpandedRow && (
                      <td className="px-2 text-center align-middle">
                        <button
                          aria-label={isExpanded ? "Collapse row" : "Expand row"}
                          onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                          className="focus:outline-none"
                          tabIndex={0}
                        >
                          {isExpanded ? "−" : "+"}
                        </button>
                      </td>
                    )}
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && isExpanded && (
                    <tr>
                      <td colSpan={columns.length + 1} className="bg-zinc-50 dark:bg-zinc-800 p-0">
                        {renderExpandedRow(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Page {page + 1} of {totalPages || 1}
        </div>
        <div className="space-x-2">
          <button
            className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
            onClick={() => setPage && setPage(page - 1)}
            disabled={page === 0}
          >
            Previous
          </button>
          <button
            className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-200 disabled:opacity-50"
            onClick={() => setPage && setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 
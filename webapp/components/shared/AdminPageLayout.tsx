import React from 'react';
import { PageTitleWithActions } from './PageTitleWithActions';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface AdminPageLayoutProps<T> {
  title: string;
  onAddClick?: () => void;
  onImportClick?: () => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder: string;
  pageSize: number;
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  isLoading: boolean;
  data: T[];
  columns: ColumnDef<T>[];
  renderExpandedRow?: (item: T) => React.ReactNode;
  emptyStateTitle: string;
  emptyStateMessage: string;
  emptyStateAction?: React.ReactNode;
  customFilters?: React.ReactNode;
  children?: React.ReactNode;
}

export function AdminPageLayout<T>({
  title,
  onAddClick,
  onImportClick,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  pageSize,
  onPageSizeChange,
  page,
  setPage,
  totalPages,
  isLoading,
  data,
  columns,
  renderExpandedRow,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateAction,
  customFilters,
  children
}: AdminPageLayoutProps<T>) {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PageTitleWithActions
        title={title}
        onAddClick={onAddClick}
        onImportClick={onImportClick}
      />

      <hr className="my-4" />
      
      <div className="flex items-center justify-between mb-2">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs text-zinc-500 dark:text-zinc-400">
            Rows per page:
          </label>
          <select
            id="pageSize"
            className="border rounded px-2 py-1 text-xs bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
            value={pageSize}
            onChange={onPageSizeChange}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      {/* Custom Filters */}
      {customFilters && (
        <div className="mb-4">
          {customFilters}
        </div>
      )}
      
      <hr className="my-4" />

      {isLoading ? (
        <LoadingOverlay />
      ) : data.length === 0 ? (
        <EmptyState
          title={emptyStateTitle}
          message={emptyStateMessage}
          action={emptyStateAction}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          renderExpandedRow={renderExpandedRow}
        />
      )}

      {children}
    </div>
  );
}

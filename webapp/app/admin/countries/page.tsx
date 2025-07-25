// app/admin/countries/page.tsx

"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useLoading } from "@/hooks/use-loading";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/ui/DataTable";
import { countryColumns } from "@/components/table/columns/countryColumns";
import { ColumnDef } from "@tanstack/react-table";
import {
  getCountriesWithPagination,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry,
  bulkCreateCountries,
  getCountryStats,
  ICountry,
  ICreateCountryRequest,
  IUpdateCountryRequest,
  getCountryTranslations,
  createCountryTranslation,
  updateCountryTranslation,
  deleteCountryTranslation,
  ICountryTranslation,
} from "@/lib/api/entities/countries";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { useToast } from "@/hooks/use-toast";
import { CountryForm } from "@/components/entity/CountryForm";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CountryTranslationForm } from "@/components/entity/CountryTranslationForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader2 } from "lucide-react";

export default function CountriesPage() {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ICountry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICountry | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const { toast } = useToast();
  const [openTranslationForm, setOpenTranslationForm] = useState<{ country: ICountry; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ country: ICountry; translation: ICountryTranslation } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null); // translationId for spinner

  // Language code-to-name map
  const languageMap = Object.fromEntries(languages.map(l => [l.code, l.name]));

  // Fetch languages for dropdowns and display
  const fetchLanguages = async () => {
    try {
      const langs = await getLanguages();
      setLanguages(langs || []);
    } catch (error) {
      setLanguages([]);
    }
  };

  // Fetch paginated countries
  const fetchPaginatedCountries = async (pageNum = 0, size = pageSize, search = searchTerm) => {
    try {
      startLoading();
      const res = await getCountriesWithPagination(pageNum + 1, size, search);
      setCountries(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
    } catch (error: any) {
      setCountries([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch countries. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await getCountryStats();
      setStats(statsData);
    } catch (error) {
      setStats(null);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleSearch(query);
        }, 300);
      };
    })(),
    []
  );

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchPaginatedCountries(page, pageSize, "");
      return;
    }
    try {
      startLoading();
      // For search, use paginated API for consistency
      const res = await getCountriesWithPagination(1, pageSize, query);
      setCountries(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
      setPage(0);
    } catch (error: any) {
      setCountries([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to search countries. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    fetchPaginatedCountries(page, pageSize, searchTerm);
    fetchStats();
    // eslint-disable-next-line
  }, [page, pageSize, searchTerm]);

  const handleCreateOrUpdate = async (data: ICreateCountryRequest | IUpdateCountryRequest) => {
    try {
      startLoading();
      if (editing?.code) {
        await updateCountry(editing.code, data as IUpdateCountryRequest);
        toast({
          title: "Success",
          description: "Country updated successfully.",
        });
      } else {
        await createCountry(data as ICreateCountryRequest);
        toast({
          title: "Success",
          description: "Country created successfully.",
        });
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedCountries(page, pageSize, searchTerm);
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save country. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?.code) {
      try {
        startLoading();
        await deleteCountry(deleteTarget.code);
        toast({
          title: "Success",
          description: "Country deleted successfully.",
        });
        setDeleteTarget(null);
        fetchPaginatedCountries(page, pageSize, searchTerm);
        fetchStats();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete country. Please try again.",
          variant: "destructive",
        });
      } finally {
        stopLoading();
      }
    }
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      startLoading();
      const countriesData: ICreateCountryRequest[] = rows.map(row => ({
        code: row.code,
        name: row.name,
        default_language_code: row.default_language_code,
        supported_language_codes: row.supported_language_codes
          ? row.supported_language_codes.split(',').map((c: string) => c.trim())
          : [],
      }));
      await bulkCreateCountries(countriesData);
      toast({
        title: "Success",
        description: `${countriesData.length} countries uploaded successfully.`,
      });
      fetchPaginatedCountries(page, pageSize, searchTerm);
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload countries. Please try again.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Translation management handlers
  const handleAddTranslation = async (country: ICountry) => {
    setOpenTranslationForm({ country });
  };
  const handleEditTranslation = async (country: ICountry, translation: ICountryTranslation) => {
    setActiveTranslationAction(translation._id!);
    setOpenTranslationForm({ country, translation });
    setTimeout(() => setActiveTranslationAction(null), 500); // Remove spinner after modal opens
  };
  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { country, translation } = openTranslationForm;
    try {
      startLoading();
      if (translation && translation._id) {
        await updateCountryTranslation(country.code, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createCountryTranslation(country.code, data);
        toast({ title: "Success", description: "Translation added." });
      }
      setOpenTranslationForm(null);
      fetchPaginatedCountries(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save translation.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };
  const handleDeleteTranslation = (country: ICountry, translation: ICountryTranslation) => {
    setActiveTranslationAction(translation._id!);
    setDeleteTranslationTarget({ country, translation });
  };
  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { country, translation } = deleteTranslationTarget;
    try {
      startLoading();
      await deleteCountryTranslation(country.code, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      setDeleteTranslationTarget(null);
      fetchPaginatedCountries(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete translation.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
      setActiveTranslationAction(null);
    }
  };

  // Extend columns with actions (no expand column here)
  const columns: ColumnDef<ICountry>[] = [
    ...((countryColumns as ColumnDef<ICountry>[]) || []).map(col => {
      if ('accessorKey' in col && col.accessorKey === "default_language_code") {
        return {
          ...col,
          cell: ({ row }: { row: { original: ICountry } }) => languageMap[row.original.default_language_code] || row.original.default_language_code,
        };
      }
      if ('accessorKey' in col && col.accessorKey === "supported_language_codes") {
        return {
          ...col,
          cell: ({ row }: { row: { original: ICountry } }) =>
            (row.original.supported_language_codes || [])
              .map((code: string) => languageMap[code] || code)
              .join(", ") || "-",
        };
      }
      return col;
    }),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: ICountry } }) => (
        <div className="flex gap-2">
          <button
            className="text-blue-600 hover:underline text-xs"
            onClick={() => {
              setEditing(row.original);
              setOpenForm(true);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:underline text-xs"
            onClick={() => setDeleteTarget(row.original)}
          >
            Delete
          </button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // CSV schema for countries
  const countryCsvSchema: CsvSchema = {
    title: "Upload Countries CSV",
    description: "Upload a CSV file with columns: code, name, default_language_code, supported_language_codes (comma-separated).",
    fields: [
      { name: "code", type: "text", required: true } as FieldSchema,
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "default_language_code", type: "text", required: true } as FieldSchema,
      { name: "supported_language_codes", type: "text", required: false } as FieldSchema,
    ],
    instructions: {
      required: ["code", "name", "default_language_code"],
      optional: ["supported_language_codes"],
    },
  };

  // Render translations for expanded row
  const renderExpandedRow = (country: ICountry) => {
    const translations = country.translations || [];
    return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Translations</span>
          <button
            className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center"
            onClick={() => setOpenTranslationForm({ country })}
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 5v10m5-5H5" />
              </svg>
              Add Translation
            </span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-200 dark:border-zinc-700 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Language</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Name</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {translations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-xs text-zinc-500">
                    No translations available.
                  </td>
                </tr>
              ) : (
                translations.map((t: any) => (
                  <tr key={t._id || t.id} className="border-b border-zinc-200 dark:border-zinc-700">
                    <td className="px-4 py-2 text-xs">
                      {languageMap[t.language_code] || t.language_code}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {t.name}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          onClick={() => handleEditTranslation(country, t)}
                          disabled={isLoading}
                          tabIndex={0}
                          aria-label="Edit Translation"
                        >
                          Edit
                          {activeTranslationAction === t._id && isLoading && (
                            <Loader2 className="animate-spin h-3 w-3 ml-1" />
                          )}
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs flex items-center gap-1"
                          onClick={() => handleDeleteTranslation(country, t)}
                          disabled={isLoading}
                          tabIndex={0}
                          aria-label="Delete Translation"
                        >
                          Delete
                          {activeTranslationAction === t._id && isLoading && (
                            <Loader2 className="animate-spin h-3 w-3 ml-1" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PageTitleWithActions
        title="Countries"
        onAddClick={() => setOpenForm(true)}
        onImportClick={() => setOpenCsvUpload(true)}
      />

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Countries</div>
          </div>
        </div>
      )}

      <hr className="my-4" />
      <div className="flex items-center justify-between mb-2">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchInputChange}
          placeholder="Search countries by name or code..."
          className="w-full max-w-xs"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs text-zinc-500 dark:text-zinc-400">Rows per page:</label>
          <select
            id="pageSize"
            className="border rounded px-2 py-1 text-xs bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <hr className="my-4" />

      {isLoading ? (
        <LoadingOverlay />
      ) : countries.length === 0 ? (
        <EmptyState
          title="No countries found"
          message="There are no countries yet. Try adding one or importing via CSV."
          action={
            <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
              Add Country
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={countries}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          renderExpandedRow={renderExpandedRow}
        />
      )}

      {/* Modals and dialogs */}
      <EntityFormModal
        title={editing ? "Edit Country" : "Add Country"}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onOpenChange={setOpenForm}
      >
        <CountryForm
          initialData={editing || undefined}
          onSubmit={handleCreateOrUpdate}
          languages={languages}
          loading={isLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Country"
        description={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <CsvUploadDialog
        schema={countryCsvSchema}
        onUpload={handleBulkUpload}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
      />

      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit Translation" : "Add Translation"}
          open={!!openTranslationForm}
          onClose={() => setOpenTranslationForm(null)}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <CountryTranslationForm
            initialData={openTranslationForm.translation || undefined}
            onSubmit={handleTranslationSubmit}
            languages={languages}
            loading={isLoading}
          />
        </EntityFormModal>
      )}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        title="Delete Translation"
        description={`Are you sure you want to delete the translation "${deleteTranslationTarget?.translation.name}" (${deleteTranslationTarget?.translation.language_code})?`}
        onCancel={() => setDeleteTranslationTarget(null)}
        onConfirm={confirmDeleteTranslation}
      />
    </div>
  );
}
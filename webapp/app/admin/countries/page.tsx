// app/admin/countries/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useLoading } from "@/hooks/use-loading";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
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
import { useToast } from "@/hooks/use-toast";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { StatisticsSection } from "@/components/shared/StatisticsSection";
import { useAdminPage } from "@/hooks/use-admin-page";
import { CountryForm } from "@/components/entity/CountryForm";
import { CountryTranslationForm } from "@/components/entity/CountryTranslationForm";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";

export default function CountriesPage() {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ICountry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICountry | null>(null);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ country: ICountry; translation?: ICountryTranslation } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ country: ICountry; translation: ICountryTranslation } | null>(null);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

  // Use the custom hook for common admin page functionality
  const {
    data: countries,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    stats,
    setStats,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
    fetchStatsData,
    toast: hookToast
  } = useAdminPage<ICountry>({
    fetchData: getCountriesWithPagination,
    fetchStats: getCountryStats,
    pageSize: 15
  });

  // Fetch languages for dropdowns and display
  const fetchLanguages = async () => {
    try {
      const res = await getLanguages();
      setLanguages(res || []);
    } catch {
      setLanguages([]);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

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
      // Refresh both data and stats after creating/updating
      fetchPaginatedData(page, pageSize, searchTerm);
      // Force refresh stats
      await fetchStatsData();
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
        fetchPaginatedData(page, pageSize, searchTerm);
        // Force refresh stats after deletion
        await fetchStatsData();
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

  const handleBulkUpload = async (countriesData: any[]) => {
    try {
      startLoading();
      
      // Process the data before sending to API
      const processedData = countriesData.map(country => ({
        ...country,
        supported_language_codes: country.supported_language_codes 
          ? country.supported_language_codes.split(',').map((code: string) => code.trim()).filter(Boolean)
          : [],
        content: country.content || undefined
      }));
      
      await bulkCreateCountries(processedData);
      toast({
        title: "Success",
        description: `${countriesData.length} countries uploaded successfully.`,
      });
      fetchPaginatedData(page, pageSize, searchTerm);
      // Force refresh stats after bulk upload
      await fetchStatsData();
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

  // Translation management handlers
  const handleAddTranslation = async (country: ICountry) => {
    setOpenTranslationForm({ country });
  };

  const handleEditTranslation = async (country: ICountry, translation: ICountryTranslation) => {
    setActiveTranslationAction(translation._id!);
    setOpenTranslationForm({ country, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
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
      fetchPaginatedData(page, pageSize, searchTerm);
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
      fetchPaginatedData(page, pageSize, searchTerm);
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

  // Render translations for expanded row
  const renderExpandedRow = (country: ICountry) => {
    const translations = country.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={Object.fromEntries(languages.map(l => [l._id || l.code, l.name]))}
        onAddTranslation={() => handleAddTranslation(country)}
        onEditTranslation={(translation) => handleEditTranslation(country, translation as ICountryTranslation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(country, translation as ICountryTranslation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isLoading}
        entityName="Country"
      />
    );
  };

  // Extend columns with actions and display
  const columns: ColumnDef<ICountry>[] = [
    ...countryColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: ICountry } }) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Country"
          onEdit={() => {
            setEditing(row.original);
            setOpenForm(true);
          }}
          onDelete={() => setDeleteTarget(row.original)}
          onAddMCQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.name });
            setOpenMCQModal(true);
          }}
          onAddFAQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.name });
            setOpenFAQModal(true);
          }}
          onAddDescriptiveQuestion={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.name });
            setOpenDescriptiveQuestionModal(true);
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // CSV schema for countries
  const countryCsvSchema: CsvSchema = {
    title: "Upload Countries CSV",
    description: "Upload a CSV file with columns: code, name, default_language_code, supported_language_codes (comma-separated), content (HTML - optional).",
    fields: [
      { name: "code", type: "text", required: true } as FieldSchema,
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "default_language_code", type: "text", required: true } as FieldSchema,
      { name: "supported_language_codes", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
    ],
  };

  return (
    <AdminPageLayout
      title="Countries"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search countries by name or code..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={countries}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No countries found"
      emptyStateMessage="There are no countries yet. Try adding one or importing via CSV."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
          Add Country
        </button>
      }
    >
      {/* Statistics */}
      <StatisticsSection stats={stats} title="Total Countries" />

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
          initialData={editing ? { ...editing, content: typeof editing.content === 'string' ? editing.content : undefined } : undefined}
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

      {/* Content Form Modals */}
      <ContentFormModals
        selectedEntity={selectedEntity}
        openMCQModal={openMCQModal}
        setOpenMCQModal={setOpenMCQModal}
        openFAQModal={openFAQModal}
        setOpenFAQModal={setOpenFAQModal}
        openDescriptiveQuestionModal={openDescriptiveQuestionModal}
        setOpenDescriptiveQuestionModal={setOpenDescriptiveQuestionModal}
        entityType="Country"
      />

      {/* Global Content Management for All Countries */}
      <GlobalContentManagement
        entityType="Country"
        entityId=""
        entityName="All Countries"
      />
    </AdminPageLayout>
  );
}
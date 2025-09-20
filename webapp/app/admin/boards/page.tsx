// app/admin/boards/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable } from "@/components/ui/DataTable";
import { boardColumns } from "@/components/table/columns/boardColumns";
import { ColumnDef } from "@tanstack/react-table";
import {
  getBoardsWithPagination,
  createBoard,
  updateBoard,
  deleteBoard,
  bulkCreateBoards,
  getBoardTranslations,
  createBoardTranslation,
  updateBoardTranslation,
  deleteBoardTranslation,
  IBoard,
  IBoardTranslation,
} from "@/lib/api/entities/boards";
import { getCountries, ICountry } from "@/lib/api/entities/countries";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { BoardForm } from "@/components/entity/BoardForm";
import { BoardTranslationForm } from "@/components/entity/BoardTranslationForm";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { MCQFormModal } from "@/components/shared/MCQFormModal";
import { FAQFormModal } from "@/components/shared/FAQFormModal";
import { DescriptiveQuestionFormModal } from "@/components/shared/DescriptiveQuestionFormModal";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";

export default function BoardsPage() {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IBoard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IBoard | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ board: IBoard; translation?: IBoardTranslation } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ board: IBoard; translation: IBoardTranslation } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

  // Use the custom hook for common admin page functionality
  const {
    data: boardsData,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<IBoard>({
    fetchData: getBoardsWithPagination,
    pageSize: 15
  });

  // Map for country and language display
  const countryMap = Object.fromEntries(countries.map(c => [c._id || c.code, c.name]));
  const languageMap = Object.fromEntries(languages.map(l => [l._id || l.code, l.name]));
  const languageIdMap = Object.fromEntries(languages.map(l => [l._id, l.name]));

  // Fetch countries and languages for dropdowns and display
  const fetchCountries = async () => {
    try {
      const res = await getCountries();
      setCountries(res || []);
    } catch {
      setCountries([]);
    }
  };

  const fetchLanguages = async () => {
    try {
      const res = await getLanguages();
      setLanguages(res || []);
    } catch {
      setLanguages([]);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchLanguages();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      if (editing?.short_code) {
        await updateBoard(editing.short_code, data);
        toast({ title: "Success", description: "Board updated successfully." });
      } else {
        await createBoard(data);
        toast({ title: "Success", description: "Board created successfully." });
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save board. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?.short_code) {
      try {
        setIsLoading(true);
        await deleteBoard(deleteTarget.short_code);
        toast({ title: "Success", description: "Board deleted successfully." });
        setDeleteTarget(null);
        fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete board. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkUpload = async (boardsData: any[]) => {
    try {
      setIsLoading(true);
      
      // Process the data before sending to API
      const processedData = boardsData.map(board => ({
        ...board,
        supported_language_ids: board.supported_language_ids 
          ? board.supported_language_ids.split(',').map((id: string) => id.trim()).filter(Boolean)
          : [],
        content: board.content || undefined
      }));
      
      await bulkCreateBoards(processedData);
      toast({
        title: "Success",
        description: `${boardsData.length} boards uploaded successfully.`,
      });
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload boards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Translation management handlers
  const handleAddTranslation = async (board: IBoard) => {
    setOpenTranslationForm({ board });
  };

  const handleEditTranslation = async (board: IBoard, translation: IBoardTranslation) => {
    setActiveTranslationAction(translation._id!);
    setOpenTranslationForm({ board, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { board, translation } = openTranslationForm;
    try {
      setIsLoading(true);
      if (translation && translation._id) {
        await updateBoardTranslation(board.short_code, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createBoardTranslation(board.short_code, data);
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
      setIsLoading(false);
    }
  };

  const handleDeleteTranslation = (board: IBoard, translation: IBoardTranslation) => {
    setActiveTranslationAction(translation._id!);
    setDeleteTranslationTarget({ board, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { board, translation } = deleteTranslationTarget;
    try {
      setIsLoading(true);
      await deleteBoardTranslation(board.short_code, translation._id!);
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
      setIsLoading(false);
      setActiveTranslationAction(null);
    }
  };

  // Render translations for expanded row
  const renderExpandedRow = (board: IBoard) => {
    const translations = board.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(board)}
        onEditTranslation={(translation) => handleEditTranslation(board, translation as IBoardTranslation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(board, translation as IBoardTranslation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isLoading}
        entityName="Board"
      />
    );
  };

  // Extend columns with actions and display
  const columns: ColumnDef<IBoard>[] = [
    ...boardColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: IBoard } }) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Board"
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

  // CSV schema for boards
  const boardCsvSchema: CsvSchema = {
    title: "Upload Boards CSV",
    description: "Upload a CSV file with columns: short_code, name, country_id, default_language_id, supported_language_ids (comma-separated), content (HTML - optional).",
    fields: [
      { name: "short_code", type: "text", required: true } as FieldSchema,
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "country_id", type: "text", required: true } as FieldSchema,
      { name: "default_language_id", type: "text", required: true } as FieldSchema,
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
      { name: "description", type: "text", required: false } as FieldSchema,
      { name: "logo_url", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
    ],
  };

  const getBoardFormInitialData = (board: IBoard) => ({
    ...board,
    country_id:
      typeof board.country_id === 'object' && board.country_id !== null && '_id' in board.country_id && typeof board.country_id._id === 'string'
        ? board.country_id._id
        : typeof board.country_id === 'string'
          ? board.country_id
          : '',
    default_language_id:
      typeof board.default_language_id === 'object' && board.default_language_id !== null && '_id' in board.default_language_id && typeof board.default_language_id._id === 'string'
        ? board.default_language_id._id
        : typeof board.default_language_id === 'string'
          ? board.default_language_id
          : '',
    supported_language_ids: Array.isArray(board.supported_language_ids)
      ? board.supported_language_ids
          .map(l =>
            typeof l === 'object' && l !== null && '_id' in l && typeof l._id === 'string'
              ? l._id
              : typeof l === 'string'
                ? l
                : null
          )
          .filter((id): id is string => typeof id === 'string')
      : [],
    content: typeof board.content === 'string' ? board.content : undefined,
  });

  return (
    <AdminPageLayout
      title="Boards"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search boards by name or short code..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={boardsData}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No boards found"
      emptyStateMessage="There are no boards yet. Try adding one or importing via CSV."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
          Add Board
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={editing ? "Edit Board" : "Add Board"}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onOpenChange={setOpenForm}
      >
        <BoardForm
          initialData={editing ? getBoardFormInitialData(editing) : undefined}
          onSubmit={handleCreateOrUpdate}
          countries={countries.map(c => ({ id: c._id || c.code, name: c.name }))}
          languages={languages.filter(l => l._id).map(l => ({ id: l._id as string, name: l.name }))}
          loading={isLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Board"
        description={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.short_code})?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <CsvUploadDialog
        schema={boardCsvSchema}
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
          <BoardTranslationForm
            initialData={openTranslationForm.translation || undefined}
            onSubmit={handleTranslationSubmit}
            languages={languages.filter(l => l._id).map(l => ({ id: l._id as string, name: l.name }))}
            loading={isLoading}
          />
        </EntityFormModal>
      )}

      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        title="Delete Translation"
        description={`Are you sure you want to delete the translation "${deleteTranslationTarget?.translation.name}"?`}
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
        entityType="Board"
      />

      {/* Global Content Management for All Boards */}
      <GlobalContentManagement
        entityType="Board"
        entityId=""
        entityName="All Boards"
      />
    </AdminPageLayout>
  );
}

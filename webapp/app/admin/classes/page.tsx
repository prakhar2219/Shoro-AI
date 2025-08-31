"use client";

import React, { useEffect, useState } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable } from "@/components/ui/DataTable";
import { classColumns } from "@/components/table/columns/classColumns";
import { ColumnDef } from "@tanstack/react-table";
import {
  getClassesWithPagination,
  createClass,
  updateClass,
  deleteClass,
  getClassTranslations,
  createClassTranslation,
  updateClassTranslation,
  deleteClassTranslation,
  IClass,
  IClassTranslation,
} from "@/lib/api/entities/classes";
import { getBoards, IBoard } from "@/lib/api/entities/boards";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { ClassForm } from "@/components/entity/ClassForm";
import { ClassTranslationForm } from "@/components/entity/ClassTranslationForm";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { useAdminPage } from "@/hooks/use-admin-page";

export default function ClassesPage() {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IClass | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();
  const [openTranslationForm, setOpenTranslationForm] = useState<{ classItem: IClass; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ classItem: IClass; translation: IClassTranslation } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

  // Use the custom hook for common admin page functionality
  const {
    data: classes,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<IClass>({
    fetchData: getClassesWithPagination,
    pageSize: 15
  });

  // Map for board and language display
  const boardMap = Object.fromEntries(boards.map(b => [b._id || b.short_code, b.name]));
  const languageMap = Object.fromEntries(languages.map(l => [l._id || l.code, l.name]));
  const languageIdMap = Object.fromEntries(languages.map(l => [l._id, l.name]));

  // Fetch boards and languages for dropdowns and display
  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res || []);
    } catch {
      setBoards([]);
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
    fetchBoards();
    fetchLanguages();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      console.log('Submitting class data:', data);
      console.log('Current editing state:', editing);
      setIsLoading(true);
      if (editing?._id) {
        await updateClass(editing._id, data);
        toast({ title: "Success", description: "Class updated successfully." });
      } else {
        await createClass(data);
        toast({ title: "Success", description: "Class created successfully." });
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save class. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        setIsLoading(true);
        await deleteClass(deleteTarget._id);
        toast({ title: "Success", description: "Class deleted successfully." });
        setDeleteTarget(null);
        fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete class. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Translation management handlers
  const handleAddTranslation = async (classItem: IClass) => {
    setOpenTranslationForm({ classItem });
  };

  const handleEditTranslation = async (classItem: IClass, translation: IClassTranslation) => {
    setActiveTranslationAction(translation._id!);
    setOpenTranslationForm({ classItem, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { classItem, translation } = openTranslationForm;
    try {
      setIsLoading(true);
      if (translation && translation._id) {
        await updateClassTranslation(classItem._id!, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createClassTranslation(classItem._id!, data);
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

  const handleDeleteTranslation = (classItem: IClass, translation: IClassTranslation) => {
    setActiveTranslationAction(translation._id!);
    setDeleteTranslationTarget({ classItem, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { classItem, translation } = deleteTranslationTarget;
    try {
      setIsLoading(true);
      await deleteClassTranslation(classItem._id!, translation._id!);
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

  // Normalize class data for form
  const getClassFormInitialData = (classItem: IClass) => {
    const result = {
      ...classItem,
      board_id:
        typeof classItem.board_id === 'object' && classItem.board_id !== null && '_id' in classItem.board_id && typeof classItem.board_id._id === 'string'
          ? classItem.board_id._id
          : typeof classItem.board_id === 'string'
            ? classItem.board_id
            : '',
    };
    console.log('getClassFormInitialData input:', classItem);
    console.log('getClassFormInitialData output:', result);
    return result;
  };

  // Render translations for expanded row
  const renderExpandedRow = (classItem: IClass) => {
    const translations = classItem.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(classItem)}
        onEditTranslation={(translation) => {
          if (translation._id) {
            handleEditTranslation(classItem, translation as IClassTranslation);
          }
        }}
        onDeleteTranslation={(translation) => {
          if (translation._id) {
            handleDeleteTranslation(classItem, translation as IClassTranslation);
          }
        }}
        activeTranslationAction={activeTranslationAction}
        isLoading={isLoading}
        entityName="Class"
      />
    );
  };

  // Extend columns with actions and display
  const columns: ColumnDef<IClass>[] = [
    ...classColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: IClass } }) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Class"
          onEdit={() => {
            console.log('Editing class:', row.original);
            console.log('Class board_id:', row.original.board_id);
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

  // CSV schema for classes
  const classCsvSchema: CsvSchema = {
    title: "Upload Classes CSV",
    description: "Upload a CSV file with columns: name, board_id, grade_level, default_language_id.",
    fields: [
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "board_id", type: "text", required: true } as FieldSchema,
      { name: "grade_level", type: "text", required: true } as FieldSchema,
      { name: "default_language_id", type: "text", required: true } as FieldSchema,
    ],
  };

  return (
    <AdminPageLayout
      title="Classes"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search classes by name or grade level..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={classes}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No classes found"
      emptyStateMessage="There are no classes yet. Try adding one or importing via CSV."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
          Add Class
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={editing ? "Edit Class" : "Add Class"}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) {
            setEditing(null);
          }
        }}
      >
        <ClassForm
          key={editing?._id || 'new'}
          defaultValues={editing ? (() => {
            const defaultVals = {
              name: editing.name,
              grade: editing.grade,
              board_id: getClassFormInitialData(editing).board_id,
              content: typeof editing.content === 'string' ? editing.content : undefined
            };
            console.log('ClassForm defaultValues:', defaultVals);
            return defaultVals;
          })() : undefined}
          onSubmit={handleCreateOrUpdate}
          boards={(() => {
            const boardsArray = boards.map(b => ({ id: b._id || b.short_code, name: b.name }));
            console.log('ClassForm boards:', boardsArray);
            return boardsArray;
          })()}
          loading={isLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Class"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <CsvUploadDialog
        schema={classCsvSchema}
        onUpload={() => {
          toast({ title: "Success", description: "CSV imported (stub)." });
        }}
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
          <ClassTranslationForm
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
        entityType="Class"
      />

      {/* Global Content Management for All Classes */}
      <GlobalContentManagement
        entityType="Class"
        entityId=""
        entityName="All Classes"
      />
    </AdminPageLayout>
  );
}

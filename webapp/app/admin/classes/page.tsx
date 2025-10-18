"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  bulkCreateClasses,
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
import { SubjectForm } from "@/components/entity/SubjectForm";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { createSubject } from "@/lib/api/entities/subjects";
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

  // Subject modal states
  const [openSubjectModal, setOpenSubjectModal] = useState(false);
  const [selectedClassForSubject, setSelectedClassForSubject] = useState<IClass | null>(null);

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

  const handleBulkUpload = async (classesData: any[]) => {
    try {
      setIsLoading(true);
      
      // Process the data before sending to API
      const processedData = classesData.map(cls => ({
        ...cls,
        grade: typeof cls.grade === 'number' ? cls.grade : Number(cls.grade),
        content: cls.content || undefined,
        language_id: cls.language_id
      }));
      
      await bulkCreateClasses(processedData);
      toast({
        title: "Success",
        description: `${classesData.length} classes uploaded successfully.`,
      });
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  // Subject handler
  const handleAddSubject = (classItem: IClass) => {
    setSelectedClassForSubject(classItem);
    setOpenSubjectModal(true);
  };

  const handleSubjectSubmit = async (data: any) => {
    try {
      // Add class_id to the subject data
      const subjectData = {
        ...data,
        class_id: selectedClassForSubject?._id
      };
      
      await createSubject(subjectData);
      // toast({ title: 'Success', description: 'Subject created successfully' });
      setOpenSubjectModal(false);
      setSelectedClassForSubject(null);
    } catch (error: any) {
      // toast({ 
      //   title: 'Error', 
      //   description: error?.response?.data?.error || 'Failed to create subject', 
      //   variant: 'destructive' 
      // });
    }
  };

  // Memoize Subject initial data to prevent infinite re-renders
  const subjectInitialData = useMemo(() => {
    if (!selectedClassForSubject) return undefined;
    return {
      class_id: selectedClassForSubject._id,
      classItem: selectedClassForSubject
    };
  }, [selectedClassForSubject]);

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
      language_id:
        typeof classItem.language_id === 'object' && classItem.language_id !== null && '_id' in classItem.language_id && typeof classItem.language_id._id === 'string'
          ? classItem.language_id._id
          : typeof classItem.language_id === 'string'
            ? classItem.language_id
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
          onAddSubject={(entityId) => {
            handleAddSubject(row.original);
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
    description: "Upload a CSV file with columns: name, board_id, language_id, grade, content (HTML - optional).",
    fields: [
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "board_id", type: "text", required: true } as FieldSchema,
      { name: "language_id", type: "text", required: true } as FieldSchema,
      { name: "grade", type: "number", required: true } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
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
              language_id: getClassFormInitialData(editing).language_id,
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

      {/* Subject Form Modal */}
      <EntityFormModal
        title={`Add Subject to Class: ${selectedClassForSubject?.name || ''}`}
        open={openSubjectModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenSubjectModal(false);
            setSelectedClassForSubject(null);
          }
        }}
      >
        <SubjectForm
          initialData={subjectInitialData}
          onSubmit={handleSubjectSubmit}
          loading={isLoading}
        />
      </EntityFormModal>

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

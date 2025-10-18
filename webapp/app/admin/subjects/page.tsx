"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SubjectForm } from "@/components/entity/SubjectForm";
import { SubjectTranslationForm } from "@/components/entity/SubjectTranslationForm";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { createChapter } from "@/lib/api/entities/chapters";
import { DataTable } from "@/components/ui/DataTable";
import { subjectColumns } from "@/components/table/columns/subjectColumns";
import { ColumnDef } from "@tanstack/react-table";
import {
  getSubjectsWithPagination,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTranslations,
  createSubjectTranslation,
  updateSubjectTranslation,
  deleteSubjectTranslation,
  ISubject,
  ISubjectTranslation,
} from "@/lib/api/entities/subjects";
import { getClasses, IClass } from "@/lib/api/entities/classes";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { bulkCreateSubjects } from "@/lib/api/entities/subjects";
import { downloadCSV } from "@/lib/utils/csv-utils";

export default function SubjectsPage() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ISubject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ISubject | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ subject: ISubject; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ subject: ISubject; translation: ISubjectTranslation } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

  // Chapter modal states
  const [openChapterModal, setOpenChapterModal] = useState(false);
  const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState<ISubject | null>(null);

  // Use the custom hook for common admin page functionality
  const {
    data: subjects,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<ISubject>({
    fetchData: getSubjectsWithPagination,
    pageSize: 15
  });

  // Map for class and language display
  const classMap = Object.fromEntries(classes.map(c => [c._id, c.name]));
  const languageMap = Object.fromEntries(languages.map(l => [l._id || l.code, l.name]));
  const languageIdMap = Object.fromEntries(languages.map(l => [l._id, l.name]));

  // Fetch classes and languages for dropdowns and display
  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res || []);
    } catch {
      setClasses([]);
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
    fetchClasses();
    fetchLanguages();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      if (editing?._id) {
        await updateSubject(editing._id, data);
        toast({ title: "Success", description: "Subject updated successfully." });
      } else {
        await createSubject(data);
        toast({ title: "Success", description: "Subject created successfully." });
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save subject. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving subject:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        setIsLoading(true);
        await deleteSubject(deleteTarget._id);
        // toast({ title: "Success", description: "Subject deleted successfully." });
        setDeleteTarget(null);
        fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        // toast({
        //   title: "Error",
        //   description: error.response?.data?.error || "Failed to delete subject. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Translation management handlers
  const handleAddTranslation = async (subject: ISubject) => {
    setOpenTranslationForm({ subject });
  };

  const handleEditTranslation = async (subject: ISubject, translation: ISubjectTranslation) => {
    setActiveTranslationAction(translation._id!);
    setOpenTranslationForm({ subject, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { subject, translation } = openTranslationForm;
    try {
      setIsLoading(true);
      if (translation && translation._id) {
        await updateSubjectTranslation(subject._id!, translation._id, data);
        // toast({ title: "Success", description: "Translation updated." });
      } else {
        await createSubjectTranslation(subject._id!, data);
        // toast({ title: "Success", description: "Translation added." });
      }
      setOpenTranslationForm(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      // toast({
      //   title: "Error",
      //   description: error.response?.data?.error || "Failed to save translation.",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTranslation = (subject: ISubject, translation: ISubjectTranslation) => {
    setActiveTranslationAction(translation._id!);
    setDeleteTranslationTarget({ subject, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { subject, translation } = deleteTranslationTarget;
    try {
      setIsLoading(true);
      await deleteSubjectTranslation(subject._id!, translation._id!);
      // toast({ title: "Success", description: "Translation deleted." });
      setDeleteTranslationTarget(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      // toast({
      //   title: "Error",
      //   description: error.response?.data?.error || "Failed to delete translation.",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
      setActiveTranslationAction(null);
    }
  };

  // Chapter handler
  const handleAddChapter = (subject: ISubject) => {
    setSelectedSubjectForChapter(subject);
    setOpenChapterModal(true);
  };

  const handleChapterSubmit = async (data: any) => {
    try {
      // Add subject_id to the chapter data
      const chapterData = {
        ...data,
        subject_id: selectedSubjectForChapter?._id
      };
      
      await createChapter(chapterData);
      toast({ title: 'Success', description: 'Chapter created successfully' });
      setOpenChapterModal(false);
      setSelectedSubjectForChapter(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create chapter', 
        variant: 'destructive' 
      });
    }
  };

  // Memoize Chapter initial data to prevent infinite re-renders
  const chapterInitialData = useMemo(() => {
    if (!selectedSubjectForChapter) return undefined;
    return {
      subject_id: selectedSubjectForChapter._id,
      subject: selectedSubjectForChapter
    };
  }, [selectedSubjectForChapter]);

  // Normalize subject data for form
  const getSubjectFormInitialData = (subject: ISubject) => ({
    ...subject,
    class_id:
      typeof subject.class_id === 'object' && subject.class_id !== null && '_id' in subject.class_id && typeof subject.class_id._id === 'string'
        ? subject.class_id._id
        : typeof subject.class_id === 'string'
          ? subject.class_id
          : '',
  });

  // Render translations for expanded row
  const renderExpandedRow = (subject: ISubject) => {
    const translations = subject.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(subject)}
        onEditTranslation={(translation) => {
          if (translation._id) {
            handleEditTranslation(subject, translation as ISubjectTranslation);
          }
        }}
        onDeleteTranslation={(translation) => {
          if (translation._id) {
            handleDeleteTranslation(subject, translation as ISubjectTranslation);
          }
        }}
        activeTranslationAction={activeTranslationAction}
        isLoading={isLoading}
        entityName="Subject"
      />
    );
  };

  // Extend columns with actions and display
  const columns: ColumnDef<ISubject>[] = [
    ...subjectColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: ISubject } }) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Subject"
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
          onAddChapter={(entityId) => {
            handleAddChapter(row.original);
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // CSV schema for subjects
  const subjectCsvSchema: CsvSchema = {
    title: "Upload Subjects CSV",
    description: "Upload a CSV with columns: class_id, language_id, code, name, icon (optional), author (optional), tag (optional - comma separated), source (optional), content (HTML - optional).",
    fields: [
      { name: "class_id", type: "text", required: true } as FieldSchema,
      { name: "language_id", type: "text", required: true } as FieldSchema,
      { name: "code", type: "text", required: true } as FieldSchema,
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "icon", type: "text", required: false } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
    ],
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      setIsLoading(true);
      // Transform rows: handle content as HTML string
      const subjectsPayload = rows.map((r: any) => {
        const content = r.content || undefined
        return {
          class_id: r.class_id,
          language_id: r.language_id,
          code: r.code,
          name: r.name,
          icon: r.icon || undefined,
          author: r.author || undefined,
          tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
          source: r.source || undefined,
          content,
        };
      });
      await bulkCreateSubjects(subjectsPayload);
      toast({ title: "Success", description: `${subjectsPayload.length} subjects uploaded successfully.` });
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.error || "Failed to upload subjects.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageLayout
      title="Subjects"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search subjects by name..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={subjects}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No subjects found"
      emptyStateMessage="There are no subjects yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
          Add Subject
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={editing ? "Edit Subject" : "Add Subject"}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onOpenChange={setOpenForm}
      >
        <SubjectForm
          initialData={editing ? getSubjectFormInitialData(editing) : undefined}
          onSubmit={handleCreateOrUpdate}
          loading={isLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit Translation" : "Add Translation"}
          open={!!openTranslationForm}
          onClose={() => setOpenTranslationForm(null)}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <SubjectTranslationForm
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

      {/* Chapter Form Modal */}
      <EntityFormModal
        title={`Add Chapter to Subject: ${selectedSubjectForChapter?.name || ''}`}
        open={openChapterModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenChapterModal(false);
            setSelectedSubjectForChapter(null);
          }
        }}
      >
        <ChapterForm
          initialData={chapterInitialData}
          onSubmit={handleChapterSubmit}
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
        entityType="Subject"
      />

      {/* Global Content Management for All Subjects */}
      <GlobalContentManagement
        entityType="Subject"
        entityId=""
        entityName="All Subjects"
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={subjectCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Sample CSV Download action (simple example row) */}
      {/* You can place a button in page header or actions; using utility directly here as reference */}
      {/* downloadCSV([{ class_id: "<classObjectId>", code: "math", name: "Mathematics", icon: "", content: "[]" }], 'subjects_sample.csv') */}
    </AdminPageLayout>
  );
} 
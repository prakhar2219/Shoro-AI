"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SubjectForm } from "@/components/entity/SubjectForm";
import { SubjectTranslationForm } from "@/components/entity/SubjectTranslationForm";
import { SearchBar } from "@/components/shared/SearchBar";
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
import { Loader2 } from "lucide-react";
import { MCQSection } from "@/components/entity/MCQSection";
import { DescriptiveQuestionSection } from "@/components/entity/DescriptiveQuestionSection";
import { FAQSection } from "@/components/entity/FAQSection";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { MCQFormModal } from "@/components/shared/MCQFormModal";
import { FAQFormModal } from "@/components/shared/FAQFormModal";
import { DescriptiveQuestionFormModal } from "@/components/shared/DescriptiveQuestionFormModal";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ISubject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ISubject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ subject: ISubject; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ subject: ISubject; translation: ISubjectTranslation } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null); // translationId for spinner
  const [isLoading, setIsLoading] = useState(false);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

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

  // Fetch paginated subjects
  const fetchPaginatedSubjects = async (pageNum = 0, size = pageSize, search = searchTerm) => {
    try {
      setIsLoading(true);
      const res = await getSubjectsWithPagination(pageNum + 1, size, search);
      setSubjects(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
    } catch (error: any) {
      setSubjects([]);
      setTotalPages(1);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
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
      fetchPaginatedSubjects(page, pageSize, "");
      return;
    }
    try {
      setIsLoading(true);
      const res = await getSubjectsWithPagination(1, pageSize, query);
      setSubjects(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
      setPage(0);
    } catch (error: any) {
      setSubjects([]);
      setTotalPages(1);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchLanguages();
  }, []);

  useEffect(() => {
    fetchPaginatedSubjects(page, pageSize, searchTerm);
    // eslint-disable-next-line
  }, [page, pageSize, searchTerm]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      if (editing?._id) {
        await updateSubject(editing._id, data);
      } else {
        await createSubject(data);
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedSubjects(page, pageSize, searchTerm);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        setIsLoading(true);
        await deleteSubject(deleteTarget._id);
        setDeleteTarget(null);
        fetchPaginatedSubjects(page, pageSize, searchTerm);
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
      } else {
        await createSubjectTranslation(subject._id!, data);
      }
      setOpenTranslationForm(null);
      fetchPaginatedSubjects(page, pageSize, searchTerm);
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
      setDeleteTranslationTarget(null);
      fetchPaginatedSubjects(page, pageSize, searchTerm);
    } finally {
      setIsLoading(false);
      setActiveTranslationAction(null);
    }
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
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Render translations for expanded row
  const renderExpandedRow = (subject: ISubject) => {
    const translations = subject.translations || [];
    return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Translations</span>
          <button
            className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center"
            onClick={() => setOpenTranslationForm({ subject })}
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
                      {languageIdMap[t.language_id] || t.language_id}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {t.name}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          onClick={() => handleEditTranslation(subject, t)}
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
                          onClick={() => handleDeleteTranslation(subject, t)}
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

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PageTitleWithActions
        title="Subjects"
        onAddClick={() => setOpenForm(true)}
      />
      <hr className="my-4" />
      <div className="flex items-center justify-between mb-2">
        <SearchBar
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder="Search subjects by name or code..."
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
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects found"
          message="There are no subjects yet. Try adding one."
          action={
            <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
              Add Subject
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          renderExpandedRow={renderExpandedRow}
        />
      )}
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
          classes={classes.map(c => ({ id: c._id as string, name: c.name }))}
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
          onOpenChange={open => !open && setOpenTranslationForm(null)}
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

      {/* Content Form Modals */}
      {selectedEntity && (
        <>
          <MCQFormModal
            open={openMCQModal}
            onOpenChange={setOpenMCQModal}
            entityType="Subject"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
          <FAQFormModal
            open={openFAQModal}
            onOpenChange={setOpenFAQModal}
            entityType="Subject"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
          <DescriptiveQuestionFormModal
            open={openDescriptiveQuestionModal}
            onOpenChange={setOpenDescriptiveQuestionModal}
            entityType="Subject"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
        </>
      )}

      {/* Global Content Management for All Subjects */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Global Content Management</h2>
        
        {/* MCQ Section - Show all MCQs for Subjects */}
        <MCQSection 
          entityType="Subject" 
          entityId="" 
          entityName="All Subjects" 
        />
        
        {/* Descriptive Questions Section - Show all questions for Subjects */}
        <DescriptiveQuestionSection 
          entityType="Subject" 
          entityId="" 
          entityName="All Subjects" 
        />
        
        {/* FAQ Section - Show all FAQs for Subjects */}
        <FAQSection 
          entityType="Subject" 
          entityId="" 
          entityName="All Subjects" 
        />
      </div>
    </div>
  );
} 
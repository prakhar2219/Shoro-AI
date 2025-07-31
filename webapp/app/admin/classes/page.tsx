"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SearchBar } from "@/components/shared/SearchBar";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader2 } from "lucide-react";
import { MCQSection } from "@/components/entity/MCQSection";
import { DescriptiveQuestionSection } from "@/components/entity/DescriptiveQuestionSection";
import { FAQSection } from "@/components/entity/FAQSection";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { MCQFormModal } from "@/components/shared/MCQFormModal";
import { FAQFormModal } from "@/components/shared/FAQFormModal";
import { DescriptiveQuestionFormModal } from "@/components/shared/DescriptiveQuestionFormModal";

export default function ClassesPage() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IClass | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const { toast } = useToast();
  const [openTranslationForm, setOpenTranslationForm] = useState<{ classItem: IClass; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ classItem: IClass; translation: IClassTranslation } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null); // translationId for spinner
  const [isLoading, setIsLoading] = useState(false);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);

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

  // Fetch paginated classes
  const fetchPaginatedClasses = async (pageNum = 0, size = pageSize, search = searchTerm) => {
    try {
      setIsLoading(true);
      const res = await getClassesWithPagination(pageNum + 1, size, search);
      setClasses(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
    } catch (error: any) {
      setClasses([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch classes. Please try again.",
        variant: "destructive",
      });
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
      fetchPaginatedClasses(page, pageSize, "");
      return;
    }
    try {
      setIsLoading(true);
      const res = await getClassesWithPagination(1, pageSize, query);
      setClasses(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
      setPage(0);
    } catch (error: any) {
      setClasses([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to search classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
    fetchLanguages();
  }, []);

  useEffect(() => {
    fetchPaginatedClasses(page, pageSize, searchTerm);
    // eslint-disable-next-line
  }, [page, pageSize, searchTerm]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
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
      fetchPaginatedClasses(page, pageSize, searchTerm);
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
        fetchPaginatedClasses(page, pageSize, searchTerm);
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
      fetchPaginatedClasses(page, pageSize, searchTerm);
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
      fetchPaginatedClasses(page, pageSize, searchTerm);
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
    description: "Upload a CSV file with columns: name, grade, board_id.",
    fields: [
      { name: "name", type: "text", required: true } as FieldSchema,
      { name: "grade", type: "number", required: true } as FieldSchema,
      { name: "board_id", type: "text", required: true } as FieldSchema,
    ],
    instructions: {
      required: ["name", "grade", "board_id"],
      optional: [],
    },
  };

  // Render translations for expanded row
  const renderExpandedRow = (classItem: IClass) => {
    const translations = classItem.translations || [];
    return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Translations</span>
          <button
            className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center"
            onClick={() => setOpenTranslationForm({ classItem })}
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
                          onClick={() => handleEditTranslation(classItem, t)}
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
                          onClick={() => handleDeleteTranslation(classItem, t)}
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

  // Normalize class data for form
  const getClassFormInitialData = (classItem: IClass) => ({
    ...classItem,
    board_id:
      typeof classItem.board_id === 'object' && classItem.board_id !== null && '_id' in classItem.board_id && typeof classItem.board_id._id === 'string'
        ? classItem.board_id._id
        : typeof classItem.board_id === 'string'
          ? classItem.board_id
          : '',
  });

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <PageTitleWithActions
        title="Classes"
        onAddClick={() => setOpenForm(true)}
        onImportClick={() => setOpenCsvUpload(true)}
      />
      <hr className="my-4" />
      <div className="flex items-center justify-between mb-2">
        <SearchBar
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder="Search classes by name or grade..."
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
      ) : classes.length === 0 ? (
        <EmptyState
          title="No classes found"
          message="There are no classes yet. Try adding one or importing via CSV."
          action={
            <button className="btn btn-primary mt-2" onClick={() => setOpenForm(true)}>
              Add Class
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={classes}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          renderExpandedRow={renderExpandedRow}
        />
      )}
      {/* Modals and dialogs */}
      <EntityFormModal
        title={editing ? "Edit Class" : "Add Class"}
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onOpenChange={setOpenForm}
      >
        <ClassForm
          defaultValues={editing ? getClassFormInitialData(editing) : undefined}
          onSubmit={handleCreateOrUpdate}
          boards={boards.map(b => ({ id: b._id || b.short_code, name: b.name }))}
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
          // fetchPaginatedClasses(page, pageSize, searchTerm);
        }}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
      />
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit Translation" : "Add Translation"}
          open={!!openTranslationForm}
          onClose={() => setOpenTranslationForm(null)}
          onOpenChange={open => !open && setOpenTranslationForm(null)}
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
      {selectedEntity && (
        <>
          <MCQFormModal
            open={openMCQModal}
            onOpenChange={setOpenMCQModal}
            entityType="Class"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
          <FAQFormModal
            open={openFAQModal}
            onOpenChange={setOpenFAQModal}
            entityType="Class"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
          <DescriptiveQuestionFormModal
            open={openDescriptiveQuestionModal}
            onOpenChange={setOpenDescriptiveQuestionModal}
            entityType="Class"
            entityId={selectedEntity.id}
            entityName={selectedEntity.name}
            onSuccess={() => {
              // Optionally refresh data or show success message
            }}
          />
        </>
      )}

      {/* Global Content Management for All Classes */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Global Content Management</h2>
        
        {/* MCQ Section - Show all MCQs for Classes */}
        <MCQSection 
          entityType="Class" 
          entityId="" 
          entityName="All Classes" 
        />
        
        {/* Descriptive Questions Section - Show all questions for Classes */}
        <DescriptiveQuestionSection 
          entityType="Class" 
          entityId="" 
          entityName="All Classes" 
        />
        
        {/* FAQ Section - Show all FAQs for Classes */}
        <FAQSection 
          entityType="Class" 
          entityId="" 
          entityName="All Classes" 
        />
      </div>
    </div>
  );
}

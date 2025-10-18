"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { subtopicColumns } from "@/components/table/columns/subtopicColumns";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { SubtopicForm } from "@/components/entity/SubtopicForm";
import { ISubtopic, getSubtopicsWithPagination, getSubtopics, createSubtopic, updateSubtopic, deleteSubtopic, bulkCreateSubtopics } from "@/lib/api/entities/subtopics";
import { getTopicsWithPagination } from "@/lib/api/entities/topics";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { downloadCSV } from "@/lib/utils/csv-utils";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { api } from '@/lib/api/axios';
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { SubtopicTranslationForm } from "@/components/entity/SubtopicTranslationForm";

export default function SubtopicsPage() {
  const [selected, setSelected] = useState<ISubtopic | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ISubtopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ subtopic: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ subtopic: ISubtopic; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const fetchSubtopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      // Try paginated endpoint first, fallback to regular endpoint
      let result;
      try {
        result = await getSubtopicsWithPagination(pageNum, size, undefined, search);
      } catch (paginationError) {
        console.warn('Paginated endpoint failed, using regular endpoint:', paginationError);
        const allSubtopics = await getSubtopics();
        const startIndex = (pageNum - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = allSubtopics.slice(startIndex, endIndex);
        result = {
          data: paginatedData,
          total: allSubtopics.length,
          totalPages: Math.ceil(allSubtopics.length / size),
          page: pageNum
        };
      }
      
      const rows = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      return { data: rows, totalPages: Number(result?.totalPages || 1), total: Number(result?.total || rows.length) };
    } catch (e: any) {
      console.error('Failed to fetch subtopics:', e);
      return { data: [], totalPages: 1, total: 0 };
    }
  }, []);

  const {
    data: subtopics,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<ISubtopic>({ fetchData: fetchSubtopicsData, pageSize: 10 });

  useEffect(() => {
    getLanguages().then((langs) => {
      setLanguages(langs || []);
      setLanguageIdMap(Object.fromEntries((langs || []).map(l => [l._id || l.code, l.name])));
    });
  }, []);


  const handleCreateOrUpdate = async (data: Partial<ISubtopic>) => {
    try {
      if (selected?._id) {
        await updateSubtopic(selected._id, data);
        toast({ title: 'Success', description: 'Subtopic updated successfully' });
      } else {
        await createSubtopic(data);
        toast({ title: 'Success', description: 'Subtopic created successfully' });
      }
      setOpenForm(false);
      setSelected(null);
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save subtopic', 
        variant: 'destructive' 
      });
      console.error('Error saving subtopic:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    await deleteSubtopic(deleteTarget._id);
    setDeleteTarget(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const handleAddTranslation = (subtopic: any) => {
    setOpenTranslationForm({ subtopic });
  };
  
  const handleEditTranslation = (subtopic: any, translation: any) => {
    setOpenTranslationForm({ subtopic, translation });
  };
  
  const handleDeleteTranslation = (subtopic: any, translation: any) => {
    setDeleteTranslationTarget({ subtopic, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/subtopics/${deleteTranslationTarget.subtopic._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/subtopics/${openTranslationForm.subtopic._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/subtopics/${openTranslationForm?.subtopic?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  const renderExpandedRow = (subtopic: any) => {
    const translations = subtopic.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(subtopic)}
        onEditTranslation={(translation) => handleEditTranslation(subtopic, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(subtopic, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="Subtopic"
      />
    );
  };

  const columns: ColumnDef<ISubtopic>[] = [
    ...subtopicColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Subtopic"
          onEdit={() => {
            setSelected(row.original);
            setOpenForm(true);
          }}
          onDelete={() => setDeleteTarget(row.original)}
          onAddMCQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenMCQModal(true);
          }}
          onAddFAQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenFAQModal(true);
          }}
          onAddDescriptiveQuestion={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenDescriptiveQuestionModal(true);
          }}
        />
      ),
    },
  ];

  // CSV schema for subtopics
  const subtopicCsvSchema: CsvSchema = {
    title: "Upload Subtopics CSV",
    description: "Upload a CSV with columns: topic_id, language_id, title, slug, author (optional), tag (optional - comma separated), source (optional), content(HTML - optional), order, is_published. IMPORTANT: Subtopics belong to Topics in the complete educational hierarchy (Board → Class → Subject → Chapter → Topic → Subtopic). Make sure your topic_id and language_id correspond to existing entities in the system.",
    fields: [
      { name: "topic_id", type: "text", required: true } as FieldSchema,
      { name: "language_id", type: "text", required: true } as FieldSchema,
      { name: "topic_name", type: "text", required: false } as FieldSchema, // For reference only - helps identify the topic
      { name: "chapter_name", type: "text", required: false } as FieldSchema, // For reference only - shows chapter context
      { name: "subject_name", type: "text", required: false } as FieldSchema, // For reference only - shows subject context
      { name: "class_name", type: "text", required: false } as FieldSchema, // For reference only - shows class context
      { name: "board_name", type: "text", required: false } as FieldSchema, // For reference only - shows board context
      { name: "title", type: "text", required: true } as FieldSchema,
      { name: "slug", type: "text", required: true } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
      { name: "order", type: "number", required: false } as FieldSchema,
      { name: "is_published", type: "boolean", required: false } as FieldSchema,
    ],
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => {
        const content = r.content || undefined;
        const order = r.order !== undefined && r.order !== '' ? Number(r.order) : 0;
        const is_published = String(r.is_published).toLowerCase() === 'true';
        // Note: Reference columns (topic_name, chapter_name, etc.) are ignored during upload
        return {
          topic_id: r.topic_id,
          language_id: r.language_id,
          title: r.title,
          slug: r.slug,
          author: r.author || undefined,
          tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
          source: r.source || undefined,
          content,
          order,
          is_published,
        };
      });
      await bulkCreateSubtopics(payload);
      toast({ title: 'Success', description: `${payload.length} subtopics uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload subtopics.', variant: 'destructive' });
    }
  };

  return (
    <AdminPageLayout
      title="Subtopics"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search subtopics..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={subtopics}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No subtopics found"
      emptyStateMessage="There are no subtopics yet. Try adding one."
    >
      <EntityFormModal
        title={selected ? "Edit Subtopic" : "Add Subtopic"}
        open={openForm}
        onOpenChange={(o) => { if (!o) { setOpenForm(false); setSelected(null); }}}
      >
        <SubtopicForm
          initialData={selected ? {
            topic_id: typeof selected.topic_id === 'string' ? selected.topic_id : (selected.topic_id as any)?._id,
            title: selected.title,
            slug: selected.slug,
            order: selected.order,
            is_published: selected.is_published,
            content: typeof selected.content === 'string' ? selected.content : ''
          } : undefined}
          onSubmit={handleCreateOrUpdate}
          loading={isDataLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Subtopic"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={subtopicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit Subtopic Translation" : "Add Subtopic Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <SubtopicTranslationForm
            initialData={openTranslationForm.translation}
            onSubmit={handleTranslationSubmit}
            loading={isDataLoading}
            languages={languages.filter(lang => lang._id) as Array<{ _id: string; name: string; code: string }>}
          />
        </EntityFormModal>
      )}

      {/* Delete Translation Confirmation */}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        onConfirm={confirmDeleteTranslation}
        onCancel={() => setDeleteTranslationTarget(null)}
      />

      {/* Content Form Modals */}
      <ContentFormModals
        entityType="Subtopic"
        openMCQModal={openMCQModal}
        setOpenMCQModal={setOpenMCQModal}
        openFAQModal={openFAQModal}
        setOpenFAQModal={setOpenFAQModal}
        openDescriptiveQuestionModal={openDescriptiveQuestionModal}
        setOpenDescriptiveQuestionModal={setOpenDescriptiveQuestionModal}
        selectedEntity={selectedEntity}
      />

      {/* Global Content Management for All Subtopics */}
      <GlobalContentManagement
        entityType="Subtopic"
        entityId=""
        entityName="All Subtopics"
      />

      {/* Example of triggering sample CSV download */}
      {/* downloadCSV([{ topic_id: "<topicId>", title: "Basics", slug: "basics", content: "", order: 1, is_published: true }], 'subtopics_sample.csv') */}
    </AdminPageLayout>
  );
}



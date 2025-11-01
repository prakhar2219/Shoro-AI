"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { DataTable } from "@/components/ui/DataTable";
import { topicColumns } from "@/components/table/columns/topicColumns";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { TopicForm } from "@/components/entity/TopicForm";
import { SubtopicForm } from "@/components/entity/SubtopicForm";
import { ITopic, getTopicsWithPagination, getTopics, createTopic, updateTopic, deleteTopic, bulkCreateTopics } from "@/lib/api/entities/topics";
import { createSubtopic } from "@/lib/api/entities/subtopics";
import { getChapters } from "@/lib/api/entities/chapters";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { downloadCSV } from "@/lib/utils/csv-utils";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { api } from '@/lib/api/axios';
import { TopicTranslationForm } from "@/components/entity/TopicTranslationForm";

export default function TopicsPage() {
  const [selected, setSelected] = useState<ITopic | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ITopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ topic: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ topic: ITopic; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  // Subtopic modal states
  const [openSubtopicModal, setOpenSubtopicModal] = useState(false);
  const [selectedTopicForSubtopic, setSelectedTopicForSubtopic] = useState<ITopic | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const fetchTopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      // Try paginated endpoint first, fallback to regular endpoint
      let result;
      try {
        result = await getTopicsWithPagination(pageNum, size, undefined, search);
      } catch (paginationError) {
        console.warn('Paginated endpoint failed, using regular endpoint:', paginationError);
        const allTopics = await getTopics();
        const startIndex = (pageNum - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = allTopics.slice(startIndex, endIndex);
        result = {
          data: paginatedData,
          total: allTopics.length,
          totalPages: Math.ceil(allTopics.length / size),
          page: pageNum
        };
      }
      
      const rows = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      return { data: rows, totalPages: Number(result?.totalPages || 1), total: Number(result?.total || rows.length) };
    } catch (e: any) {
      console.error('Failed to fetch topics:', e);
      return { data: [], totalPages: 1, total: 0 };
    }
  }, []);

  const {
    data: topics,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<ITopic>({ fetchData: fetchTopicsData, pageSize: 10 });

  useEffect(() => {
    getLanguages().then((langs) => {
      const languagesArray = Array.isArray(langs) ? langs : [];
      if (!Array.isArray(langs)) {
        console.warn('Languages API returned non-array data:', langs);
      }
      setLanguages(languagesArray);
      setLanguageIdMap(Object.fromEntries(languagesArray.map((l: any) => [l._id || l.code, l.name])));
    });
  }, []);


  const handleCreateOrUpdate = async (data: Partial<ITopic>) => {
    try {
      if (selected?._id) {
        await updateTopic(selected._id, data);
        toast({ title: 'Success', description: 'Topic updated successfully' });
      } else {
        await createTopic(data);
        toast({ title: 'Success', description: 'Topic created successfully' });
      }
      setOpenForm(false);
      setSelected(null);
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save topic', 
        variant: 'destructive' 
      });
      console.error('Error saving topic:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    await deleteTopic(deleteTarget._id);
    setDeleteTarget(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const handleAddTranslation = (topic: any) => {
    setOpenTranslationForm({ topic });
  };
  
  const handleEditTranslation = (topic: any, translation: any) => {
    setOpenTranslationForm({ topic, translation });
  };
  
  const handleDeleteTranslation = (topic: any, translation: any) => {
    setDeleteTranslationTarget({ topic, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/topics/${deleteTranslationTarget.topic._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/topics/${openTranslationForm.topic._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/topics/${openTranslationForm?.topic?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  // Subtopic handler
  const handleAddSubtopic = (topic: ITopic) => {
    setSelectedTopicForSubtopic(topic);
    setOpenSubtopicModal(true);
  };

  const handleSubtopicSubmit = async (data: any) => {
    try {
      // Add topic_id to the subtopic data
      const subtopicData = {
        ...data,
        topic_id: selectedTopicForSubtopic?._id
      };
      
      await createSubtopic(subtopicData);
      toast({ title: 'Success', description: 'Subtopic created successfully' });
      setOpenSubtopicModal(false);
      setSelectedTopicForSubtopic(null);
      // Optionally refresh the page or show success message
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create subtopic', 
        variant: 'destructive' 
      });
    }
  };

  // Memoize Subtopic initial data to prevent infinite re-renders
  const subtopicInitialData = useMemo(() => {
    if (!selectedTopicForSubtopic) return undefined;
    return { 
      topic_id: selectedTopicForSubtopic._id,
      topic: selectedTopicForSubtopic,
      language_id: selectedTopicForSubtopic.language_id // Inherit parent's language
    };
  }, [selectedTopicForSubtopic]);

  const renderExpandedRow = (topic: any) => {
    const translations = topic.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(topic)}
        onEditTranslation={(translation) => handleEditTranslation(topic, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(topic, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="Topic"
      />
    );
  };

  const columns: ColumnDef<ITopic>[] = [
    ...topicColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Topic"
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
          onAddSubtopic={(entityId) => {
            handleAddSubtopic(row.original);
          }}
        />
      ),
    },
  ];

  // CSV schema for topics
  const topicCsvSchema: CsvSchema = {
    title: "Upload Topics CSV",
    description: "Upload a CSV with columns: chapter_id, language_id, supported_language_ids (comma-separated IDs - optional), title, slug, author (optional), tag (optional - comma separated), source (optional), content(HTML - optional), order, is_published. IMPORTANT: Topics belong to Chapters in the educational hierarchy (Board → Class → Subject → Chapter → Topic). Make sure your chapter_id and language_id correspond to existing entities in the system.",
    orderConfig: {
      parentField: 'chapter_id',
      languageField: 'language_id',
      autoIncrement: true
    },
    fields: [
      { name: "chapter_id", type: "text", required: true } as FieldSchema,
      { name: "language_id", type: "text", required: true } as FieldSchema,
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
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
        // Standardized order validation: non-negative integer, default 0
        const order = (r.order !== undefined && r.order !== '') 
          ? Math.max(0, Math.floor(Math.abs(Number(r.order)))) 
          : 0;
        const is_published = String(r.is_published).toLowerCase() === 'true';
        return {
          chapter_id: r.chapter_id,
          language_id: r.language_id,
          supported_language_ids: r.supported_language_ids 
            ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id)
            : [],
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
      const chunkSize = 500;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await bulkCreateTopics(chunk);
      }
      toast({ title: 'Success', description: `${payload.length} topics uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload topics.', variant: 'destructive' });
    }
  };

  return (
    <AdminPageLayout
      title="Topics"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search topics..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={topics}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No topics found"
      emptyStateMessage="There are no topics yet. Try adding one."
    >
      <EntityFormModal
        title={selected ? "Edit Topic" : "Add Topic"}
        open={openForm}
        onOpenChange={(o) => { if (!o) { setOpenForm(false); setSelected(null); }}}
      >
        <TopicForm
          initialData={selected ? {
            _id: selected._id,
            chapter_id: typeof selected.chapter_id === 'string' ? selected.chapter_id : (selected.chapter_id as any)?._id,
            language_id: typeof selected.language_id === 'string' ? selected.language_id : (selected.language_id as any)?._id,
            supported_language_ids: selected.supported_language_ids || [],
            title: selected.title,
            slug: selected.slug,
            order: selected.order,
            is_published: selected.is_published,
            content: typeof selected.content === 'string' ? selected.content : '',
            tag: selected.tag || [],
            source: selected.source || '',
            author: selected.author || ''
          } : undefined}
          onSubmit={handleCreateOrUpdate}
          loading={isDataLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Topic"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={topicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Subtopic Form Modal */}
      <EntityFormModal
        title={`Add Subtopic to Topic: ${selectedTopicForSubtopic?.title || ''}`}
        open={openSubtopicModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenSubtopicModal(false);
            setSelectedTopicForSubtopic(null);
          }
        }}
      >
        <SubtopicForm
          initialData={subtopicInitialData as any}
          onSubmit={handleSubtopicSubmit}
          loading={isDataLoading}
        />
      </EntityFormModal>

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit Topic Translation" : "Add Topic Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <TopicTranslationForm
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
        entityType="Topic"
        openMCQModal={openMCQModal}
        setOpenMCQModal={setOpenMCQModal}
        openFAQModal={openFAQModal}
        setOpenFAQModal={setOpenFAQModal}
        openDescriptiveQuestionModal={openDescriptiveQuestionModal}
        setOpenDescriptiveQuestionModal={setOpenDescriptiveQuestionModal}
        selectedEntity={selectedEntity}
      />

      {/* Global Content Management for All Topics */}
      <GlobalContentManagement
        entityType="Topic"
        entityId=""
        entityName="All Topics"
      />

      {/* Example of triggering sample CSV download */}
      {/* downloadCSV([{ chapter_id: "<chapterId>", title: "Introduction", slug: "introduction", content: "", order: 1, is_published: true }], 'topics_sample.csv') */}
    </AdminPageLayout>
  );
}



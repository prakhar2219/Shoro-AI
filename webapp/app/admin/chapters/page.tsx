"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { ChapterCard } from "@/components/entity/ChapterCard";
import { TopicForm } from "@/components/entity/TopicForm";
import Link from "next/link";
import { getChapters, createChapter, updateChapter, deleteChapter, bulkCreateChapters } from "@/lib/api/entities/chapters";
import { createTopic } from "@/lib/api/entities/topics";
import { chapterColumns } from '@/components/table/columns/chapterColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { ChapterTranslationForm } from '@/components/entity/ChapterTranslationForm';
import { api } from '@/lib/api/axios';
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/utils/csv-utils";

type Chapter = any;

type ChapterInput = any;

export default function ChapterAdminPage() {
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ chapter: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ chapter: Chapter; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  // Topic modal states
  const [openTopicModal, setOpenTopicModal] = useState(false);
  const [selectedChapterForTopic, setSelectedChapterForTopic] = useState<Chapter | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchChaptersData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      console.log('Fetching chapters with params:', { page: pageNum, limit: size, search });
      const result = await getChapters({ page: pageNum, limit: size, search });
      console.log('Chapters API response:', result);
      
      // Handle different response structures from the API
      if (result && typeof result === 'object') {
        // If it's a paginated response
        if (result.data && Array.isArray(result.data)) {
          console.log('Using paginated response structure');
          return {
            data: result.data,
            totalPages: result.totalPages || Math.ceil((result.total || 0) / size),
            total: result.total || 0,
          };
        }
        // If it's a direct array response
        if (Array.isArray(result)) {
          console.log('Using direct array response structure');
          return {
            data: result,
            totalPages: Math.ceil(result.length / size),
            total: result.length,
          };
        }
      }
      
      // Fallback for unexpected response structure
      console.warn('Unexpected chapters API response structure:', result);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    }
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: chapters,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<Chapter>({
    fetchData: fetchChaptersData,
    pageSize: 10
  });

  useEffect(() => {
    getLanguages().then((langs: any) => {
      // Ensure langs is always an array
      const languagesArray = Array.isArray(langs) 
        ? langs 
        : Array.isArray(langs?.data) 
        ? langs.data 
        : [];
      
      // Log for debugging if we get unexpected data
      if (!Array.isArray(langs) && !Array.isArray(langs?.data)) {
        console.warn('Languages API returned non-array data:', langs);
      }
      
      setLanguages(languagesArray);
      setLanguageIdMap(Object.fromEntries(languagesArray.map((l: any) => [l._id || l.code, l.name])));
    });
  }, []);

  const handleSave = async (data: ChapterInput) => {
    try {
      if (selected && selected._id) {
        await updateChapter(selected._id, data);
        toast({ title: 'Success', description: 'Chapter updated successfully' });
      } else {
        await createChapter(data);
        toast({ title: 'Success', description: 'Chapter created successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenModal(false);
      setSelected(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save chapter', 
        variant: 'destructive' 
      });
      console.error('Error saving chapter:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        await deleteChapter(deleteTarget._id);
        await fetchPaginatedData(page, pageSize, searchTerm);
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  const handleAddTranslation = (chapter: any) => {
    setOpenTranslationForm({ chapter });
  };
  
  const handleEditTranslation = (chapter: any, translation: any) => {
    setOpenTranslationForm({ chapter, translation });
  };
  
  const handleDeleteTranslation = (chapter: any, translation: any) => {
    setDeleteTranslationTarget({ chapter, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/chapters/${deleteTranslationTarget.chapter._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/chapters/${openTranslationForm.chapter._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/chapters/${openTranslationForm?.chapter?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  // Topic handler
  const handleAddTopic = (chapter: Chapter) => {
    setSelectedChapterForTopic(chapter);
    setOpenTopicModal(true);
  };

  const handleTopicSubmit = async (data: any) => {
    try {
      // Add chapter_id to the topic data
      const topicData = {
        ...data,
        chapter_id: selectedChapterForTopic?._id
      };
      
      await createTopic(topicData);
      toast({ title: 'Success', description: 'Topic created successfully' });
      setOpenTopicModal(false);
      setSelectedChapterForTopic(null);
      // Optionally refresh the page or show success message
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create topic', 
        variant: 'destructive' 
      });
    }
  };

  // Memoize Topic initial data to prevent infinite re-renders
  const topicInitialData = useMemo(() => {
    if (!selectedChapterForTopic) return undefined;
    return { 
      chapter_id: selectedChapterForTopic._id,
      chapter: selectedChapterForTopic,
      language_id: selectedChapterForTopic.language_id // Inherit parent's language
    };
  }, [selectedChapterForTopic]);

  const renderExpandedRow = (chapter: any) => {
    const translations = chapter.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(chapter)}
        onEditTranslation={(translation) => handleEditTranslation(chapter, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(chapter, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="Chapter"
      />
    );
  };

  // Add actions column to columns
  const columns: ColumnDef<Chapter>[] = [
    ...chapterColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Chapter"
          onEdit={() => {
            setSelected(row.original);
            setOpenModal(true);
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
          onAddTopic={(entityId) => {
            handleAddTopic(row.original);
          }}
        />
      ),
    },
  ];

  // CSV schema for chapters
  const chapterCsvSchema: CsvSchema = {
    title: "Upload Chapters CSV",
    description: "Upload a CSV with columns: board_id, class_id, subject_id, language_id, supported_language_ids (comma-separated IDs - optional), title, slug, author (optional), tag (optional - comma separated), source (optional), downloadNotes (optional - URL), downloadPDF (optional - URL), downloadQA (optional - URL), content(HTML - optional), order, is_published",
    fields: [
      { name: "board_id", type: "text", required: true } as FieldSchema,
      { name: "class_id", type: "text", required: true } as FieldSchema,
      { name: "subject_id", type: "text", required: true } as FieldSchema,
      { name: "language_id", type: "text", required: true } as FieldSchema,
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
      { name: "title", type: "text", required: true } as FieldSchema,
      { name: "slug", type: "text", required: true } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "downloadNotes", type: "text", required: false } as FieldSchema,
      { name: "downloadPDF", type: "text", required: false } as FieldSchema,
      { name: "downloadQA", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
      { name: "order", type: "number", required: false } as FieldSchema,
      { name: "is_published", type: "boolean", required: false } as FieldSchema,
    ],
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => {
        const content = r.content || undefined
        const order = r.order !== undefined && r.order !== '' ? Number(r.order) : 0;
        const is_published = String(r.is_published).toLowerCase() === 'true';
        return {
          board_id: r.board_id,
          class_id: r.class_id,
          subject_id: r.subject_id,
          language_id: r.language_id,
          supported_language_ids: r.supported_language_ids 
            ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id)
            : [],
          title: r.title,
          slug: r.slug,
          author: r.author || undefined,
          tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
          source: r.source || undefined,
          downloadNotes: r.downloadNotes || undefined,
          downloadPDF: r.downloadPDF || undefined,
          downloadQA: r.downloadQA || undefined,
          content,
          order,
          is_published,
        };
      });
      // Upload in chunks to avoid oversized requests/timeouts
      const chunkSize = 500;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await bulkCreateChapters(chunk);
      }
      toast({ title: 'Success', description: `${payload.length} chapters uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload chapters.', variant: 'destructive' });
    }
  };

  return (
    <AdminPageLayout
      title="Chapters"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search chapters..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={chapters}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No chapters found"
      emptyStateMessage="There are no chapters yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add Chapter
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit Chapter" : "Add Chapter"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <ChapterForm initialData={selected || undefined} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Chapter"
        description={`Are you sure you want to delete Chapter #${deleteTarget?.order}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      <EntityFormModal
        title={openTranslationForm?.translation ? "Edit Translation" : "Add Translation"}
        open={!!openTranslationForm}
        onOpenChange={(open) => { if (!open) setOpenTranslationForm(open ? openTranslationForm : null); }}
      >
        {openTranslationForm && (
          <ChapterTranslationForm
            initialData={openTranslationForm.translation || {}}
            onSubmit={handleTranslationSubmit}
            loading={isDataLoading}
            languages={languages.filter(l => l._id).map(l => ({ _id: l._id || l.code, name: l.name, code: l.code }))}
          />
        )}
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        title="Delete Translation"
        description={`Are you sure you want to delete translation for Chapter #${deleteTranslationTarget?.chapter?.order}?`}
        onCancel={() => setDeleteTranslationTarget(null)}
        onConfirm={confirmDeleteTranslation}
      />

      {/* Topic Form Modal */}
      <EntityFormModal
        title={`Add Topic to Chapter: ${selectedChapterForTopic?.title || ''}`}
        open={openTopicModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenTopicModal(false);
            setSelectedChapterForTopic(null);
          }
        }}
      >
        <TopicForm
          initialData={topicInitialData}
          onSubmit={handleTopicSubmit}
          loading={isDataLoading}
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
        entityType="Chapter"
      />

      {/* Global Content Management for All Chapters */}
      <GlobalContentManagement
        entityType="Chapter"
        entityId=""
        entityName="All Chapters"
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={chapterCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Example of triggering sample CSV download */}
      {/* downloadCSV([{ board_id: "<boardId>", class_id: "<classId>", subject_id: "<subjectId>", title: "Intro", slug: "intro", content: "[]", order: 1, is_published: true }], 'chapters_sample.csv') */}
    </AdminPageLayout>
  );
} 
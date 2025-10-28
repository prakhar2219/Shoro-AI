"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBQuestionForm } from "@/components/entity/GBQuestionForm";
import { getGBQuestions, createGBQuestion, updateGBQuestion, deleteGBQuestion, bulkCreateGBQuestions, IGBQuestion } from "@/lib/api/entities/gbQuestions";
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { getGBSubtopics, IGBSubtopic } from '@/lib/api/entities/gbSubtopics';
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { api } from '@/lib/api/axios';
import { GBQuestionTranslationForm } from "@/components/entity/GBQuestionTranslationForm";

type GBQuestion = IGBQuestion;
type GBQuestionInput = Omit<IGBQuestion, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBQuestionsPage() {
  const [selected, setSelected] = useState<GBQuestion | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBQuestion | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [subtopics, setSubtopics] = useState<IGBSubtopic[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  // Translation states
  const [openTranslationForm, setOpenTranslationForm] = useState<{ gbQuestion: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ gbQuestion: GBQuestion; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBQuestionsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBQuestions({
      page: pageNum,
      limit: size,
      search: search || undefined
    });
    
    return {
      data: result.data || [],
      totalPages: result.totalPages || 1,
      total: result.total || 0,
    };
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: questions,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<GBQuestion>({
    fetchData: fetchGBQuestionsData,
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
    getGBSubtopics().then((subtopics) => {
      setSubtopics(Array.isArray(subtopics) ? subtopics : subtopics?.data || []);
    });
  }, []);

  const handleSave = async (data: GBQuestionInput) => {
    try {
      if (selected && selected._id) {
        await updateGBQuestion(selected._id, data);
        toast({ title: 'Success', description: 'GB Question updated successfully' });
      } else {
        await createGBQuestion(data);
        toast({ title: 'Success', description: 'GB Question created successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save GB question', 
        variant: 'destructive' 
      });
    } finally {
      setOpenModal(false);
      setSelected(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        await deleteGBQuestion(deleteTarget._id);
        toast({ title: 'Success', description: 'GB Question deleted successfully' });
        await fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error?.response?.data?.error || 'Failed to delete GB question', 
          variant: 'destructive' 
        });
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Translation management functions
  const handleAddTranslation = (gbQuestion: any) => {
    setOpenTranslationForm({ gbQuestion });
  };
  
  const handleEditTranslation = (gbQuestion: any, translation: any) => {
    setOpenTranslationForm({ gbQuestion, translation });
  };
  
  const handleDeleteTranslation = (gbQuestion: any, translation: any) => {
    setDeleteTranslationTarget({ gbQuestion, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/gb-questions/${deleteTranslationTarget.gbQuestion._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/gb-questions/${openTranslationForm.gbQuestion._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/gb-questions/${openTranslationForm?.gbQuestion?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  const renderExpandedRow = (gbQuestion: any) => {
    const translations = gbQuestion.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(gbQuestion)}
        onEditTranslation={(translation) => handleEditTranslation(gbQuestion, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(gbQuestion, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="GB Question"
      />
    );
  };

  // Basic columns for GB Questions
  const baseColumns: ColumnDef<GBQuestion>[] = [
    { accessorKey: "_id", header: "ID" },
    { accessorKey: "question", header: "Question" },
    { accessorKey: "slug", header: "Slug" },
    { 
      accessorKey: "gb_subtopic_id", 
      header: "GB Subtopic",
      cell: ({ row }) => {
        const subtopic = row.original.gb_subtopic_id as any;
        return subtopic && typeof subtopic === 'object' && 'name' in subtopic ? subtopic.name : '—';
      }
    },
    { 
      accessorKey: "gb_topic_id", 
      header: "GB Topic",
      cell: ({ row }) => {
        const subtopic = row.original.gb_subtopic_id as any;
        const topic = subtopic?.gb_topic_id;
        return topic && typeof topic === 'object' && 'name' in topic ? topic.name : '—';
      }
    },
    { 
      accessorKey: "gb_category_id", 
      header: "GB Category",
      cell: ({ row }) => {
        const subtopic = row.original.gb_subtopic_id as any;
        const topic = subtopic?.gb_topic_id;
        const category = topic?.gb_category_id;
        return category && typeof category === 'object' && 'name' in category ? category.name : '—';
      }
    },
    { 
      accessorKey: "language_id", 
      header: "Language",
      cell: ({ row }) => {
        const lang = row.original.language_id as any;
        return lang && typeof lang === 'object' && 'name' in lang ? lang.name : '—';
      }
    },
    { accessorKey: "difficulty_level", header: "Difficulty" },
    { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
  ];

  // Add action column to the columns
  const columns: ColumnDef<GBQuestion>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const question = row.original;
        return (
          <EntityActionDropdown
            entity={question}
            entityType="GB Question"
            onEdit={() => {
              setSelected(question);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(question)}
            onAddMCQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: question.question });
              setOpenMCQModal(true);
            }}
            onAddFAQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: question.question });
              setOpenFAQModal(true);
            }}
            onAddDescriptiveQuestion={(entityId) => {
              setSelectedEntity({ id: entityId, name: question.question });
              setOpenDescriptiveQuestionModal(true);
            }}
          />
        );
      },
    },
  ];

  // CSV schema for GB questions - memoized to handle dependencies
  const gbQuestionCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Questions CSV",
    description: "Upload a CSV with columns: gb_subtopic_id, question, slug, answer, content, language_id, order, image, tag, source, author, difficulty_level, is_published. IMPORTANT: GB Questions belong to GB Subtopics in the complete General Blogging hierarchy (GB Category → GB Topic → GB Subtopic → GB Question). Make sure your gb_subtopic_id corresponds to an existing GB subtopic. You can find GB subtopic IDs in the GB Subtopics admin section.",
    fields: [
      { 
        name: "gb_subtopic_id", 
        type: "custom", 
        required: true,
        customRenderer: (value: any, onChange: (value: any) => void) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select GB Subtopic" />
            </SelectTrigger>
            <SelectContent>
              {subtopics.map((subtopic) => (
                <SelectItem key={subtopic._id || subtopic.name} value={subtopic._id || ''}>
                  {subtopic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        validation: (value: any) => {
          if (!value) return "GB Subtopic is required";
          const isValid = subtopics.some(subtopic => subtopic._id === value);
          return isValid ? null : "Invalid GB Subtopic selected";
        }
      } as FieldSchema,
      { name: "gb_subtopic_name", type: "text", required: false } as FieldSchema, // For reference only - helps identify the GB subtopic
      { name: "gb_topic_name", type: "text", required: false } as FieldSchema, // For reference only - shows GB topic context
      { name: "gb_category_name", type: "text", required: false } as FieldSchema, // For reference only - shows GB category context
      { name: "question", type: "text", required: true } as FieldSchema,
      { name: "slug", type: "text", required: true } as FieldSchema,
      { 
        name: "language_id", 
        type: "custom", 
        required: true,
        customRenderer: (value: any, onChange: (value: any) => void) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang._id || lang.code} value={lang._id || ''}>
                  {lang.name} ({lang.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        validation: (value: any) => {
          if (!value) return "Language is required";
          const isValid = languages.some(lang => lang._id === value);
          return isValid ? null : "Invalid language selected";
        }
      } as FieldSchema,
      { name: "answer", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
      { name: "order", type: "number", required: false } as FieldSchema,
      { name: "image", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { 
        name: "difficulty_level", 
        type: "select", 
        required: false,
        options: ["easy", "medium", "hard"],
        defaultValue: "medium"
      } as FieldSchema,
      { name: "is_published", type: "boolean", required: false } as FieldSchema,
    ],
  }), [languages, subtopics]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        gb_subtopic_id: r.gb_subtopic_id,
        // Note: Reference columns (gb_subtopic_name, gb_topic_name, gb_category_name) are ignored during upload
        question: r.question,
        slug: r.slug,
        answer: r.answer || undefined,
        content: r.content || undefined,
        language_id: r.language_id,
        order: typeof r.order === 'number' ? r.order : Number(r.order || 0),
        image: r.image || undefined,
        tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
        source: r.source || undefined,
        author: r.author || undefined,
        difficulty_level: r.difficulty_level || 'medium',
        is_published: !!r.is_published,
      }));
      
      await bulkCreateGBQuestions(payload);
      toast({ title: 'Success', description: `${payload.length} GB questions uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to upload GB questions.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <AdminPageLayout
      title="GB Questions"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search GB questions..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={questions}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No GB questions found"
      emptyStateMessage="There are no GB questions yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add GB Question
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit GB Question" : "Add GB Question"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <GBQuestionForm initialData={selected || undefined} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Question"
        description={`Are you sure you want to delete GB Question "${deleteTarget?.question}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* Global Content Management for All GB Questions */}
      <GlobalContentManagement
        entityType="GBQuestion"
        entityId=""
        entityName="All GB Questions"
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbQuestionCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit GB Question Translation" : "Add GB Question Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <GBQuestionTranslationForm
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
        entityType="GB Question"
        openMCQModal={openMCQModal}
        setOpenMCQModal={setOpenMCQModal}
        openFAQModal={openFAQModal}
        setOpenFAQModal={setOpenFAQModal}
        openDescriptiveQuestionModal={openDescriptiveQuestionModal}
        setOpenDescriptiveQuestionModal={setOpenDescriptiveQuestionModal}
        selectedEntity={selectedEntity}
      />
    </AdminPageLayout>
  );
};

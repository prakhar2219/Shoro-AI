"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBTopicForm } from "@/components/entity/GBTopicForm";
import { GBSubtopicForm } from "@/components/entity/GBSubtopicForm";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { IGBTopic, getGBTopics, createGBTopic, updateGBTopic, deleteGBTopic, bulkCreateGBTopics } from "@/lib/api/entities/gbTopics";
import { createGBSubtopic } from "@/lib/api/entities/gbSubtopics";
import { getGBCategories } from "@/lib/api/entities/gbCategories";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { api } from '@/lib/api/axios';
import { GBTopicTranslationForm } from "@/components/entity/GBTopicTranslationForm";
import { formatSlug } from "@/lib/utils";

type GBTopic = IGBTopic;
type GBTopicInput = Omit<IGBTopic, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBTopicsPage() {
  const [selected, setSelected] = useState<IGBTopic | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IGBTopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  // Translation states
  const [openTranslationForm, setOpenTranslationForm] = useState<{ gbTopic: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ gbTopic: IGBTopic; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  // GB Subtopic modal states
  const [openGBSubtopicModal, setOpenGBSubtopicModal] = useState(false);
  const [selectedTopicForGBSubtopic, setSelectedTopicForGBSubtopic] = useState<GBTopic | null>(null);
  
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBTopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBTopics({
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
  } = useAdminPage<GBTopic>({
    fetchData: fetchGBTopicsData,
    pageSize: 10
  });

  useEffect(() => {
    getGBCategories().then((cats) => setCategories(Array.isArray(cats) ? cats : []));
    getLanguages().then((langs) => {
      const languagesArray = Array.isArray(langs) ? langs : [];
      if (!Array.isArray(langs)) {
        console.warn('Languages API returned non-array data:', langs);
      }
      setLanguages(languagesArray);
      setLanguageIdMap(Object.fromEntries(languagesArray.map((l: any) => [l._id || l.code, l.name])));
    });
  }, []);

  const handleSave = async (data: GBTopicInput) => {
    try {
      if (selected && selected._id) {
        await updateGBTopic(selected._id, data);
        toast({ title: 'Success', description: 'GB Topic updated successfully' });
      } else {
        await createGBTopic(data);
        toast({ title: 'Success', description: 'GB Topic created successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save GB topic', 
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
        await deleteGBTopic(deleteTarget._id);
        toast({ title: 'Success', description: 'GB Topic deleted successfully' });
        await fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error?.response?.data?.error || 'Failed to delete GB topic', 
          variant: 'destructive' 
        });
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Translation management functions
  const handleAddTranslation = (gbTopic: any) => {
    setOpenTranslationForm({ gbTopic });
  };
  
  const handleEditTranslation = (gbTopic: any, translation: any) => {
    setOpenTranslationForm({ gbTopic, translation });
  };
  
  const handleDeleteTranslation = (gbTopic: any, translation: any) => {
    setDeleteTranslationTarget({ gbTopic, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/gb-topics/${deleteTranslationTarget.gbTopic._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/gb-topics/${openTranslationForm.gbTopic._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/gb-topics/${openTranslationForm?.gbTopic?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  // GB Subtopic handler
  const handleAddGBSubtopic = (gbTopic: GBTopic) => {
    setSelectedTopicForGBSubtopic(gbTopic);
    setOpenGBSubtopicModal(true);
  };

  const handleGBSubtopicSubmit = async (data: any) => {
    try {
      // Add gb_topic_id to the GB subtopic data
      const gbSubtopicData = {
        ...data,
        gb_topic_id: selectedTopicForGBSubtopic?._id
      };
      
      await createGBSubtopic(gbSubtopicData);
      toast({ title: 'Success', description: 'GB Subtopic created successfully' });
      setOpenGBSubtopicModal(false);
      setSelectedTopicForGBSubtopic(null);
      // Optionally refresh the page or show success message
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create GB subtopic', 
        variant: 'destructive' 
      });
    }
  };

  // Memoize GB Subtopic initial data to prevent infinite re-renders
  const gbSubtopicInitialData = useMemo(() => {
    if (!selectedTopicForGBSubtopic) return undefined;
    return {
      gb_topic_id: selectedTopicForGBSubtopic._id,
      gb_topic: selectedTopicForGBSubtopic,
      language_id: selectedTopicForGBSubtopic.language_id // Inherit parent's language
    };
  }, [selectedTopicForGBSubtopic]);

  const renderExpandedRow = (gbTopic: any) => {
    const translations = gbTopic.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(gbTopic)}
        onEditTranslation={(translation) => handleEditTranslation(gbTopic, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(gbTopic, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="GB Topic"
      />
    );
  };

  // Basic columns for GB Topics
  const baseColumns: ColumnDef<GBTopic>[] = [
    { accessorKey: "_id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { 
      accessorKey: "gb_category_id", 
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original.gb_category_id as any;
        return cat && typeof cat === 'object' && 'name' in cat ? cat.name : '—';
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
    { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
  ];

  // Add action column to the columns
  const columns: ColumnDef<GBTopic>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const topic = row.original;
        return (
          <EntityActionDropdown
            entity={topic}
            entityType="GB Topic"
            onEdit={() => {
              setSelected(topic);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(topic)}
            onAddMCQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: topic.name });
              setOpenMCQModal(true);
            }}
            onAddFAQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: topic.name });
              setOpenFAQModal(true);
            }}
            onAddDescriptiveQuestion={(entityId) => {
              setSelectedEntity({ id: entityId, name: topic.name });
              setOpenDescriptiveQuestionModal(true);
            }}
            onAddGBSubtopic={(entityId) => {
              handleAddGBSubtopic(topic);
            }}
          />
        );
      },
    },
  ];

  // CSV schema for GB topics - memoized to handle dependencies
  const gbTopicCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Topics CSV",
    description: "Upload a CSV with columns: gb_category_id, name, slug, description, content, language_id, supported_language_ids (comma-separated IDs - optional), order, image, tag, source, author, is_published. IMPORTANT: GB Topics belong to GB Categories in the General Blogging hierarchy (GB Category → GB Topic). Make sure your gb_category_id corresponds to an existing GB category. You can find GB category IDs in the GB Categories admin section.",
    orderConfig: {
      parentField: 'gb_category_id',
      languageField: 'language_id',
      autoIncrement: true
    },
    fields: [
      { 
        name: "gb_category_id", 
        type: "custom", 
        required: true,
        customRenderer: (value: any, onChange: (value: any) => void) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select GB Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id || ''}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        validation: (value: any) => {
          if (!value) return "GB Category is required";
          const isValid = categories.some(cat => cat._id === value);
          return isValid ? null : "Invalid GB Category selected";
        }
      } as FieldSchema,
      { name: "gb_category_name", type: "text", required: false } as FieldSchema, // For reference only - helps identify the GB category
      { name: "name", type: "text", required: true } as FieldSchema,
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
                <SelectItem key={lang._id} value={lang._id || ''}>
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
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
      { name: "description", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
      { name: "order", type: "number", required: false } as FieldSchema,
      { name: "image", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "is_published", type: "boolean", required: false } as FieldSchema,
    ],
  }), [categories, languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        gb_category_id: r.gb_category_id,
        // Note: Reference column (gb_category_name) is ignored during upload
        name: r.name,
        slug: formatSlug(r.slug),
        description: r.description || undefined,
        content: r.content || undefined,
        language_id: r.language_id,
        supported_language_ids: r.supported_language_ids 
          ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id)
          : [],
        // Standardized order validation: non-negative integer, default 0
        order: (r.order !== undefined && r.order !== '') 
          ? Math.max(0, Math.floor(Math.abs(Number(r.order)))) 
          : 0,
        image: r.image || undefined,
        tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
        source: r.source || undefined,
        author: r.author || undefined,
        is_published: !!r.is_published,
      }));
      
      await bulkCreateGBTopics(payload);
      toast({ title: 'Success', description: `${payload.length} GB topics uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to upload GB topics.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <AdminPageLayout
      title="GB Topics"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search GB topics..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={topics}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No GB topics found"
      emptyStateMessage="There are no GB topics yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add GB Topic
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit GB Topic" : "Add GB Topic"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <GBTopicForm initialData={selected || undefined} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Topic"
        description={`Are you sure you want to delete GB Topic "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* Global Content Management for All GB Topics */}
      <GlobalContentManagement
        entityType="GBTopic"
        entityId=""
        entityName="All GB Topics"
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbTopicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit GB Topic Translation" : "Add GB Topic Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <GBTopicTranslationForm
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

      {/* GB Subtopic Form Modal */}
      <EntityFormModal
        title={`Add GB Subtopic to Topic: ${selectedTopicForGBSubtopic?.name || ''}`}
        open={openGBSubtopicModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenGBSubtopicModal(false);
            setSelectedTopicForGBSubtopic(null);
          }
        }}
      >
        <GBSubtopicForm
          initialData={gbSubtopicInitialData}
          onSubmit={handleGBSubtopicSubmit}
          loading={isDataLoading}
        />
      </EntityFormModal>

      {/* Content Form Modals */}
      <ContentFormModals
        entityType="GB Topic"
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
}

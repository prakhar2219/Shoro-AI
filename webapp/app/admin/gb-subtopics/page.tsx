"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBSubtopicForm } from "@/components/entity/GBSubtopicForm";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { IGBSubtopic, getGBSubtopics, createGBSubtopic, updateGBSubtopic, deleteGBSubtopic, bulkCreateGBSubtopics } from "@/lib/api/entities/gbSubtopics";
import { getGBTopics } from "@/lib/api/entities/gbTopics";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { api } from '@/lib/api/axios';
import { GBSubtopicTranslationForm } from "@/components/entity/GBSubtopicTranslationForm";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

type GBSubtopic = IGBSubtopic;
type GBSubtopicInput = Omit<IGBSubtopic, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBSubtopicsPage() {
  const [selected, setSelected] = useState<IGBSubtopic | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IGBSubtopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  // Translation states
  const [openTranslationForm, setOpenTranslationForm] = useState<{ gbSubtopic: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ gbSubtopic: IGBSubtopic; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBSubtopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBSubtopics({
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
  } = useAdminPage<GBSubtopic>({
    fetchData: fetchGBSubtopicsData,
    pageSize: 10
  });

  useEffect(() => {
    getGBTopics().then((topics) => setTopics(Array.isArray(topics) ? topics : topics?.data || []));
    getLanguages().then((langs) => {
      setLanguages(langs || []);
      setLanguageIdMap(Object.fromEntries((langs || []).map(l => [l._id || l.code, l.name])));
    });
  }, []);

  const handleSave = async (data: GBSubtopicInput) => {
    try {
      if (selected && selected._id) {
        await updateGBSubtopic(selected._id, data);
        toast({ title: 'Success', description: 'GB Subtopic updated successfully' });
      } else {
        await createGBSubtopic(data);
        toast({ title: 'Success', description: 'GB Subtopic created successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save GB subtopic', 
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
        await deleteGBSubtopic(deleteTarget._id);
        toast({ title: 'Success', description: 'GB Subtopic deleted successfully' });
        await fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error?.response?.data?.error || 'Failed to delete GB subtopic', 
          variant: 'destructive' 
        });
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Translation management functions
  const handleAddTranslation = (gbSubtopic: any) => {
    setOpenTranslationForm({ gbSubtopic });
  };
  
  const handleEditTranslation = (gbSubtopic: any, translation: any) => {
    setOpenTranslationForm({ gbSubtopic, translation });
  };
  
  const handleDeleteTranslation = (gbSubtopic: any, translation: any) => {
    setDeleteTranslationTarget({ gbSubtopic, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/gb-subtopics/${deleteTranslationTarget.gbSubtopic._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/gb-subtopics/${openTranslationForm.gbSubtopic._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/gb-subtopics/${openTranslationForm?.gbSubtopic?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  const renderExpandedRow = (gbSubtopic: any) => {
    const translations = gbSubtopic.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(gbSubtopic)}
        onEditTranslation={(translation) => handleEditTranslation(gbSubtopic, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(gbSubtopic, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="GB Subtopic"
      />
    );
  };

  // Basic columns for GB Subtopics
  const baseColumns: ColumnDef<GBSubtopic>[] = [
    { accessorKey: "_id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { 
      accessorKey: "gb_topic_id", 
      header: "GB Topic",
      cell: ({ row }) => {
        const topic = row.original.gb_topic_id as any;
        return topic && typeof topic === 'object' && 'name' in topic ? topic.name : '—';
      }
    },
    { 
      accessorKey: "gb_category_id", 
      header: "GB Category",
      cell: ({ row }) => {
        const topic = row.original.gb_topic_id as any;
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
    { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
  ];

  // Add action column to the columns
  const columns: ColumnDef<GBSubtopic>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subtopic = row.original;
        return (
          <EntityActionDropdown
            entity={subtopic}
            entityType="GB Subtopic"
            onEdit={() => {
              setSelected(subtopic);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(subtopic)}
            onAddMCQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: subtopic.name });
              setOpenMCQModal(true);
            }}
            onAddFAQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: subtopic.name });
              setOpenFAQModal(true);
            }}
            onAddDescriptiveQuestion={(entityId) => {
              setSelectedEntity({ id: entityId, name: subtopic.name });
              setOpenDescriptiveQuestionModal(true);
            }}
          />
        );
      },
    },
  ];

  // CSV schema for GB subtopics - memoized to handle dependencies
  const gbSubtopicCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Subtopics CSV",
    description: "Upload a CSV with columns: gb_topic_id, name, slug, description, content, language_id, order, image, tag, source, author, is_published. IMPORTANT: GB Subtopics belong to GB Topics in the General Blogging hierarchy (GB Category → GB Topic → GB Subtopic). Make sure your gb_topic_id corresponds to an existing GB topic. You can find GB topic IDs in the GB Topics admin section.",
    fields: [
      { 
        name: "gb_topic_id", 
        type: "custom", 
        required: true,
        customRenderer: (value: any, onChange: (value: any) => void) => (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select GB Topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic._id} value={topic._id || ''}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        validation: (value: any) => {
          if (!value) return "GB Topic is required";
          const isValid = topics.some(topic => topic._id === value);
          return isValid ? null : "Invalid GB Topic selected";
        }
      } as FieldSchema,
      { name: "gb_topic_name", type: "text", required: false } as FieldSchema, // For reference only - helps identify the GB topic
      { name: "gb_category_name", type: "text", required: false } as FieldSchema, // For reference only - shows GB category context
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
      { name: "description", type: "text", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
      { name: "order", type: "number", required: false } as FieldSchema,
      { name: "image", type: "text", required: false } as FieldSchema,
      { name: "tag", type: "text", required: false } as FieldSchema,
      { name: "source", type: "text", required: false } as FieldSchema,
      { name: "author", type: "text", required: false } as FieldSchema,
      { name: "is_published", type: "boolean", required: false } as FieldSchema,
    ],
  }), [topics, languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        gb_topic_id: r.gb_topic_id,
        // Note: Reference columns (gb_topic_name, gb_category_name) are ignored during upload
        name: r.name,
        slug: r.slug,
        description: r.description || undefined,
        content: r.content || undefined,
        language_id: r.language_id,
        order: typeof r.order === 'number' ? r.order : Number(r.order || 0),
        image: r.image || undefined,
        tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
        source: r.source || undefined,
        author: r.author || undefined,
        is_published: !!r.is_published,
      }));
      
      await bulkCreateGBSubtopics(payload);
      toast({ title: 'Success', description: `${payload.length} GB subtopics uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to upload GB subtopics.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <AdminPageLayout
      title="GB Subtopics"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search GB subtopics..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={subtopics}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No GB subtopics found"
      emptyStateMessage="There are no GB subtopics yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add GB Subtopic
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit GB Subtopic" : "Add GB Subtopic"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <GBSubtopicForm initialData={selected || undefined} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Subtopic"
        description={`Are you sure you want to delete GB Subtopic "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbSubtopicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit GB Subtopic Translation" : "Add GB Subtopic Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <GBSubtopicTranslationForm
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
        entityType="GB Subtopic"
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

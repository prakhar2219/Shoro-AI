"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBCategoryForm } from "@/components/entity/GBCategoryForm";
import { GBTopicForm } from "@/components/entity/GBTopicForm";
import { getGBCategories, createGBCategory, updateGBCategory, deleteGBCategory, bulkCreateGBCategories, IGBCategory } from "@/lib/api/entities/gbCategories";
import { createGBTopic } from "@/lib/api/entities/gbTopics";
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { api } from '@/lib/api/axios';
import { GBCategoryTranslationForm } from "@/components/entity/GBCategoryTranslationForm";

type GBCategory = IGBCategory;
type GBCategoryInput = Omit<IGBCategory, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBCategoriesPage() {
  const [selected, setSelected] = useState<GBCategory | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBCategory | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  
  // Translation states
  const [openTranslationForm, setOpenTranslationForm] = useState<{ gbCategory: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ gbCategory: GBCategory; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  
  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  
  // GB Topic modal states
  const [openGBTopicModal, setOpenGBTopicModal] = useState(false);
  const [selectedCategoryForGBTopic, setSelectedCategoryForGBTopic] = useState<GBCategory | null>(null);
  
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBCategoriesData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBCategories({ page: pageNum, limit: size, search });
    return {
      data: result.data || [],
      totalPages: result.totalPages || 1,
      total: result.total || 0,
    };
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: categories,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<GBCategory>({
    fetchData: fetchGBCategoriesData,
    pageSize: 10
  });

  useEffect(() => {
    getLanguages().then((langs) => {
      const languagesArray = Array.isArray(langs) ? langs : [];
      if (!Array.isArray(langs)) {
        console.warn('Languages API returned non-array data:', langs);
      }
      setLanguages(languagesArray);
      setLanguageIdMap(Object.fromEntries(languagesArray.filter(l => (l as any)._id).map((l: any) => [l._id!, l.name])));
    });
  }, []);

  const handleSave = async (data: GBCategoryInput) => {
    try {
      if (selected && selected._id) {
        await updateGBCategory(selected._id, data);
        toast({ title: 'Success', description: 'GB Category updated successfully' });
      } else {
        await createGBCategory(data);
        toast({ title: 'Success', description: 'GB Category created successfully' });
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to save GB category', 
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
        await deleteGBCategory(deleteTarget._id);
        toast({ title: 'Success', description: 'GB Category deleted successfully' });
        await fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        toast({ 
          title: 'Error', 
          description: error?.response?.data?.error || 'Failed to delete GB category', 
          variant: 'destructive' 
        });
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  // Translation management functions
  const handleAddTranslation = (gbCategory: any) => {
    setOpenTranslationForm({ gbCategory });
  };
  
  const handleEditTranslation = (gbCategory: any, translation: any) => {
    setOpenTranslationForm({ gbCategory, translation });
  };
  
  const handleDeleteTranslation = (gbCategory: any, translation: any) => {
    setDeleteTranslationTarget({ gbCategory, translation });
  };
  
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/gb-categories/${deleteTranslationTarget.gbCategory._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/gb-categories/${openTranslationForm.gbCategory._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/gb-categories/${openTranslationForm?.gbCategory?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  // GB Topic handler
  const handleAddGBTopic = (gbCategory: GBCategory) => {
    setSelectedCategoryForGBTopic(gbCategory);
    setOpenGBTopicModal(true);
  };

  const handleGBTopicSubmit = async (data: any) => {
    try {
      // Add gb_category_id to the GB topic data
      const gbTopicData = {
        ...data,
        gb_category_id: selectedCategoryForGBTopic?._id
      };
      
      await createGBTopic(gbTopicData);
      toast({ title: 'Success', description: 'GB Topic created successfully' });
      setOpenGBTopicModal(false);
      setSelectedCategoryForGBTopic(null);
      // Optionally refresh the page or show success message
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to create GB topic', 
        variant: 'destructive' 
      });
    }
  };

  // Memoize GB Topic initial data to prevent infinite re-renders
  const gbTopicInitialData = useMemo(() => {
    if (!selectedCategoryForGBTopic) return undefined;
    return {
      gb_category_id: selectedCategoryForGBTopic._id,
      gb_category: selectedCategoryForGBTopic,
      language_id: selectedCategoryForGBTopic.language_id // Inherit parent's language
    };
  }, [selectedCategoryForGBTopic]);

  const renderExpandedRow = (gbCategory: any) => {
    const translations = gbCategory.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(gbCategory)}
        onEditTranslation={(translation) => handleEditTranslation(gbCategory, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(gbCategory, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="GB Category"
      />
    );
  };

  // Basic columns for GB Categories
  const baseColumns: ColumnDef<GBCategory>[] = [
    { accessorKey: "_id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { 
      accessorKey: "language_id", 
      header: "Language",
      cell: ({ row }) => {
        const lang = row.original.language_id as any;
        return lang && typeof lang === 'object' && 'name' in lang ? lang.name : '—';
      }
    },
    { accessorKey: "author", header: "Author" },
    { accessorKey: "is_published", header: "Published", cell: i => (i.getValue() ? 'Yes' : 'No') },
  ];

  // Add action column to the columns
  const columns: ColumnDef<GBCategory>[] = [
    ...baseColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <EntityActionDropdown
            entity={category}
            entityType="GB Category"
            onEdit={() => {
              setSelected(category);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(category)}
            onAddMCQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: category.name });
              setOpenMCQModal(true);
            }}
            onAddFAQ={(entityId) => {
              setSelectedEntity({ id: entityId, name: category.name });
              setOpenFAQModal(true);
            }}
            onAddDescriptiveQuestion={(entityId) => {
              setSelectedEntity({ id: entityId, name: category.name });
              setOpenDescriptiveQuestionModal(true);
            }}
            onAddGBTopic={(entityId) => {
              handleAddGBTopic(category);
            }}
          />
        );
      },
    },
  ];

  // CSV schema for GB categories - memoized to handle languages dependency
  const gbCategoryCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Categories CSV",
    description: "Upload a CSV with columns: name, slug, description, content, language_id, supported_language_ids (comma-separated IDs - optional), order, image, tag, source, author, is_published",
    fields: [
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
              {languages.filter(lang => lang._id).map((lang) => (
                <SelectItem key={lang._id!} value={lang._id!}>
                  {lang.name} ({lang.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        validation: (value: any) => {
          if (!value) return "Language is required";
          const isValid = languages.filter(lang => lang._id).some(lang => lang._id === value);
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
  }), [languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        name: r.name,
        slug: r.slug,
        description: r.description || undefined,
        content: r.content || undefined,
        language_id: r.language_id,
        supported_language_ids: r.supported_language_ids 
          ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id)
          : [],
        order: typeof r.order === 'number' ? r.order : Number(r.order || 0),
        image: r.image || undefined,
        tag: r.tag ? r.tag.split(',').map((t: string) => t.trim()) : [],
        source: r.source || undefined,
        author: r.author || undefined,
        is_published: !!r.is_published,
      }));
      
      await bulkCreateGBCategories(payload);
      toast({ title: 'Success', description: `${payload.length} GB categories uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.error || 'Failed to upload GB categories.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <AdminPageLayout
      title="GB Categories"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search GB categories..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={categories}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No GB categories found"
      emptyStateMessage="There are no GB categories yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add GB Category
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit GB Category" : "Add GB Category"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <GBCategoryForm initialData={selected || undefined} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Category"
        description={`Are you sure you want to delete GB Category "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* Global Content Management for All GB Categories */}
      <GlobalContentManagement
        entityType="GBCategory"
        entityId=""
        entityName="All GB Categories"
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbCategoryCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* GB Topic Form Modal */}
      <EntityFormModal
        title={`Add GB Topic to Category: ${selectedCategoryForGBTopic?.name || ''}`}
        open={openGBTopicModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenGBTopicModal(false);
            setSelectedCategoryForGBTopic(null);
          }
        }}
      >
        <GBTopicForm
          initialData={gbTopicInitialData}
          onSubmit={handleGBTopicSubmit}
          loading={isDataLoading}
        />
      </EntityFormModal>

      {/* Translation Form Modal */}
      {openTranslationForm && (
        <EntityFormModal
          title={openTranslationForm.translation ? "Edit GB Category Translation" : "Add GB Category Translation"}
          open={!!openTranslationForm}
          onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        >
          <GBCategoryTranslationForm
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
        entityType="GB Category"
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

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBCategoryForm } from "@/components/entity/GBCategoryForm";
import { getGBCategories, createGBCategory, updateGBCategory, deleteGBCategory, bulkCreateGBCategories, IGBCategory } from "@/lib/api/entities/gbCategories";
import { gbCategoryColumns } from '@/components/table/columns/gbCategoryColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GBCategory = IGBCategory;
type GBCategoryInput = Omit<IGBCategory, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBCategoriesPage() {
  const [selected, setSelected] = useState<GBCategory | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBCategory | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
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
      setLanguages(langs || []);
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

  // Add action column to the columns
  const columns: ColumnDef<GBCategory>[] = [
    ...(gbCategoryColumns as ColumnDef<GBCategory>[]),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <EntityActionDropdown
            entity={category}
            entityType="gb-category"
            onEdit={() => {
              setSelected(category);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(category)}
            onAddMCQ={() => {}}
            onAddFAQ={() => {}}
            onAddDescriptiveQuestion={() => {}}
          />
        );
      },
    },
  ];

  // CSV schema for GB categories - memoized to handle languages dependency
  const gbCategoryCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Categories CSV",
    description: "Upload a CSV with columns: name, slug, description, content, language_id, order, image, tag, source, author, is_published",
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
              {languages.map((lang) => (
                <SelectItem key={lang._id} value={lang._id}>
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
  }), [languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
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
        <GBCategoryForm initialData={selected || {}} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Category"
        description={`Are you sure you want to delete GB Category "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbCategoryCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
}

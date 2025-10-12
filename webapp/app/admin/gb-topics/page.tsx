"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBTopicForm } from "@/components/entity/GBTopicForm";
import { getGBTopics, createGBTopic, updateGBTopic, deleteGBTopic, bulkCreateGBTopics, IGBTopic } from "@/lib/api/entities/gbTopics";
import { gbTopicColumns } from '@/components/table/columns/gbTopicColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { getGBCategories, IGBCategory } from '@/lib/api/entities/gbCategories';
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GBTopic = IGBTopic;
type GBTopicInput = Omit<IGBTopic, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBTopicsPage() {
  const [selected, setSelected] = useState<GBTopic | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBTopic | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [categories, setCategories] = useState<IGBCategory[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBTopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBTopics({ page: pageNum, limit: size, search });
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
    getLanguages().then((langs) => {
      setLanguages(langs || []);
    });
    getGBCategories().then((cats) => {
      setCategories(cats.data || []);
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

  // Add action column to the columns
  const columns: ColumnDef<GBTopic>[] = [
    ...(gbTopicColumns as ColumnDef<GBTopic>[]),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const topic = row.original;
        return (
          <EntityActionDropdown
            entity={topic}
            entityType="gb-topic"
            onEdit={() => {
              setSelected(topic);
              setOpenModal(true);
            }}
            onDelete={() => setDeleteTarget(topic)}
            onAddMCQ={() => {}}
            onAddFAQ={() => {}}
            onAddDescriptiveQuestion={() => {}}
          />
        );
      },
    },
  ];

  // CSV schema for GB topics - memoized to handle dependencies
  const gbTopicCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Topics CSV",
    description: "Upload a CSV with columns: gb_category_id, name, slug, description, content, language_id, order, image, tag, source, author, is_published",
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
                <SelectItem key={cat._id} value={cat._id}>
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
  }), [categories, languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        gb_category_id: r.gb_category_id,
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
        <GBTopicForm initialData={selected || {}} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Topic"
        description={`Are you sure you want to delete GB Topic "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbTopicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
}

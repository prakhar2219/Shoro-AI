"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBSubtopicForm } from "@/components/entity/GBSubtopicForm";
import { getGBSubtopics, createGBSubtopic, updateGBSubtopic, deleteGBSubtopic, bulkCreateGBSubtopics, IGBSubtopic } from "@/lib/api/entities/gbSubtopics";
import { gbSubtopicColumns } from '@/components/table/columns/gbSubtopicColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { getGBTopics, IGBTopic } from '@/lib/api/entities/gbTopics';
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GBSubtopic = IGBSubtopic;
type GBSubtopicInput = Omit<IGBSubtopic, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBSubtopicsPage() {
  const [selected, setSelected] = useState<GBSubtopic | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBSubtopic | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [topics, setTopics] = useState<IGBTopic[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBSubtopicsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBSubtopics({ page: pageNum, limit: size, search });
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
    getLanguages().then((langs) => {
      setLanguages(langs || []);
    });
    getGBTopics().then((topics) => {
      setTopics(topics.data || []);
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

  // Add action column to the columns
  const columns: ColumnDef<GBSubtopic>[] = [
    ...(gbSubtopicColumns as ColumnDef<GBSubtopic>[]),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subtopic = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(subtopic);
                setOpenModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(subtopic)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // CSV schema for GB subtopics - memoized to handle dependencies
  const gbSubtopicCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Subtopics CSV",
    description: "Upload a CSV with columns: gb_topic_id, name, slug, description, content, language_id, order, image, tag, source, author, is_published",
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
                <SelectItem key={topic._id} value={topic._id}>
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
  }), [topics, languages]);

  const handleBulkUpload = async (rows: any[]) => {
    try {
      const payload = rows.map(r => ({
        gb_topic_id: r.gb_topic_id,
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
        <GBSubtopicForm initialData={selected || {}} onSubmit={handleSave} loading={isDataLoading} />
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
    </AdminPageLayout>
  );
};

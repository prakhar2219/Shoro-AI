"use client";

import { useCallback, useEffect, useState } from "react";
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
import { ITopic, getTopicsWithPagination, getTopics, createTopic, updateTopic, deleteTopic, bulkCreateTopics } from "@/lib/api/entities/topics";
import { getChapters } from "@/lib/api/entities/chapters";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { downloadCSV } from "@/lib/utils/csv-utils";

export default function TopicsPage() {
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState<ITopic | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ITopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  const fetchTopicsData = useCallback(async (pageNum: number, size: number, _search: string) => {
    try {
      // Try paginated endpoint first, fallback to regular endpoint
      let result;
      try {
        result = await getTopicsWithPagination(pageNum, size);
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
    (async () => {
      const res = await getChapters({ page: 1, limit: 100 });
      const rows = res.data || res || [];
      setChapters(rows.map((c: any) => ({ id: c._id, title: c.title })));
    })();
  }, []);

  const handleCreateOrUpdate = async (data: Partial<ITopic>) => {
    if (selected?._id) await updateTopic(selected._id, data);
    else await createTopic(data);
    setOpenForm(false);
    setSelected(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    await deleteTopic(deleteTarget._id);
    setDeleteTarget(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const columns: ColumnDef<ITopic>[] = [
    ...topicColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const t = row.original as ITopic;
        return (
          <div className="flex gap-2">
            <button className="text-blue-600" onClick={() => { setSelected(t); setOpenForm(true); }}>Edit</button>
            <button className="text-red-600" onClick={() => setDeleteTarget(t)}>Delete</button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ];

  // CSV schema for topics
  const topicCsvSchema: CsvSchema = {
    title: "Upload Topics CSV",
    description: "Upload a CSV with columns: chapter_id, title, slug, content(HTML - optional), order, is_published",
    fields: [
      { name: "chapter_id", type: "text", required: true } as FieldSchema,
      { name: "title", type: "text", required: true } as FieldSchema,
      { name: "slug", type: "text", required: true } as FieldSchema,
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
        return {
          chapter_id: r.chapter_id,
          title: r.title,
          slug: r.slug,
          content,
          order,
          is_published,
        };
      });
      await bulkCreateTopics(payload);
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
            chapter_id: typeof selected.chapter_id === 'string' ? selected.chapter_id : (selected.chapter_id as any)?._id,
            title: selected.title,
            slug: selected.slug,
            order: selected.order,
            is_published: selected.is_published,
            content: typeof selected.content === 'string' ? selected.content : ''
          } : undefined}
          onSubmit={handleCreateOrUpdate}
          chapters={chapters}
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



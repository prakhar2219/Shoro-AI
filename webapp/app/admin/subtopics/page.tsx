"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { subtopicColumns } from "@/components/table/columns/subtopicColumns";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminPage } from "@/hooks/use-admin-page";
import { useToast } from "@/hooks/use-toast";
import { SubtopicForm } from "@/components/entity/SubtopicForm";
import { ISubtopic, getSubtopicsWithPagination, getSubtopics, createSubtopic, updateSubtopic, deleteSubtopic, bulkCreateSubtopics } from "@/lib/api/entities/subtopics";
import { getTopicsWithPagination } from "@/lib/api/entities/topics";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { downloadCSV } from "@/lib/utils/csv-utils";

export default function SubtopicsPage() {
  const [topics, setTopics] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState<ISubtopic | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ISubtopic | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  const fetchSubtopicsData = useCallback(async (pageNum: number, size: number, _search: string) => {
    try {
      // Try paginated endpoint first, fallback to regular endpoint
      let result;
      try {
        result = await getSubtopicsWithPagination(pageNum, size);
      } catch (paginationError) {
        console.warn('Paginated endpoint failed, using regular endpoint:', paginationError);
        const allSubtopics = await getSubtopics();
        const startIndex = (pageNum - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = allSubtopics.slice(startIndex, endIndex);
        result = {
          data: paginatedData,
          total: allSubtopics.length,
          totalPages: Math.ceil(allSubtopics.length / size),
          page: pageNum
        };
      }
      
      const rows = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      return { data: rows, totalPages: Number(result?.totalPages || 1), total: Number(result?.total || rows.length) };
    } catch (e: any) {
      console.error('Failed to fetch subtopics:', e);
      return { data: [], totalPages: 1, total: 0 };
    }
  }, []);

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
  } = useAdminPage<ISubtopic>({ fetchData: fetchSubtopicsData, pageSize: 10 });

  useEffect(() => {
    (async () => {
      const res = await getTopicsWithPagination(1, 100);
      const rows = res.data || res || [];
      setTopics(rows.map((t: any) => ({ id: t._id, title: t.title })));
    })();
  }, []);

  const handleCreateOrUpdate = async (data: Partial<ISubtopic>) => {
    if (selected?._id) await updateSubtopic(selected._id, data);
    else await createSubtopic(data);
    setOpenForm(false);
    setSelected(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;
    await deleteSubtopic(deleteTarget._id);
    setDeleteTarget(null);
    await fetchPaginatedData(page, pageSize, searchTerm);
  };

  const columns: ColumnDef<ISubtopic>[] = [
    ...subtopicColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const s = row.original as ISubtopic;
        return (
          <div className="flex gap-2">
            <button className="text-blue-600" onClick={() => { setSelected(s); setOpenForm(true); }}>Edit</button>
            <button className="text-red-600" onClick={() => setDeleteTarget(s)}>Delete</button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ];

  // CSV schema for subtopics
  const subtopicCsvSchema: CsvSchema = {
    title: "Upload Subtopics CSV",
    description: "Upload a CSV with columns: topic_id, title, slug, content(HTML - optional), order, is_published",
    fields: [
      { name: "topic_id", type: "text", required: true } as FieldSchema,
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
          topic_id: r.topic_id,
          title: r.title,
          slug: r.slug,
          content,
          order,
          is_published,
        };
      });
      await bulkCreateSubtopics(payload);
      toast({ title: 'Success', description: `${payload.length} subtopics uploaded successfully.` });
      await fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload subtopics.', variant: 'destructive' });
    }
  };

  return (
    <AdminPageLayout
      title="Subtopics"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search subtopics..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={subtopics}
      columns={columns}
      emptyStateTitle="No subtopics found"
      emptyStateMessage="There are no subtopics yet. Try adding one."
    >
      <EntityFormModal
        title={selected ? "Edit Subtopic" : "Add Subtopic"}
        open={openForm}
        onOpenChange={(o) => { if (!o) { setOpenForm(false); setSelected(null); }}}
      >
        <SubtopicForm
          initialData={selected ? {
            topic_id: typeof selected.topic_id === 'string' ? selected.topic_id : (selected.topic_id as any)?._id,
            title: selected.title,
            slug: selected.slug,
            order: selected.order,
            is_published: selected.is_published,
            content: typeof selected.content === 'string' ? selected.content : ''
          } : undefined}
          onSubmit={handleCreateOrUpdate}
          topics={topics}
          loading={isDataLoading}
        />
      </EntityFormModal>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Subtopic"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={subtopicCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />

      {/* Global Content Management for All Subtopics */}
      <GlobalContentManagement
        entityType="Subtopic"
        entityId=""
        entityName="All Subtopics"
      />

      {/* Example of triggering sample CSV download */}
      {/* downloadCSV([{ topic_id: "<topicId>", title: "Basics", slug: "basics", content: "", order: 1, is_published: true }], 'subtopics_sample.csv') */}
    </AdminPageLayout>
  );
}



// webapp/app/admin/short-questions/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { ShortQuestionForm } from "@/components/entity/ShortQuestionForm";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { CsvUploadDialog } from "@/components/shared/CsvUploadDialog";
import { useLoading } from "@/hooks/use-loading";
import { useToast } from "@/hooks/use-toast";
import {
  getShortQuestions,
  createShortQuestion,
  updateShortQuestion,
  deleteShortQuestion,
  bulkCreateShortQuestions,
  IShortQuestion,
} from "@/lib/api/entities/shortQuestions";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import { useAdminPage } from "@/hooks/use-admin-page";
import { IMCQ } from "@/lib/api/entities/mcqs"; // reuse type pattern if needed

export default function ShortQuestionsPage() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IShortQuestion | null>(null);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);

  const fetchData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      const result = await getShortQuestions({ page: pageNum, limit: size, search });
      if (result && result.data) {
        return { data: result.data, totalPages: result.totalPages || 1, total: result.total || result.totalCount || 0 };
      }
      if (Array.isArray(result)) {
        return { data: result, totalPages: Math.ceil(result.length / size), total: result.length };
      }
      return { data: [], totalPages: 1, total: 0 };
    } catch (err) {
      console.error(err);
      return { data: [], totalPages: 1, total: 0 };
    }
  }, []);

  const {
    data,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<IShortQuestion>({ fetchData, pageSize: 10 });

  useEffect(() => {
    // load initial data if desired
  }, []);

  const handleCreateOrUpdate = async (payload: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateShortQuestion(editing._id!, payload);
      } else {
        await createShortQuestion(payload);
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save short question', variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      startLoading();
      await deleteShortQuestion(id);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      startLoading();
      // transform rows for short questions (question and answer only)
      const payload = rows.map(r => ({
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        supported_language_ids: r.supported_language_ids ? r.supported_language_ids.split(',').map((s: string) => s.trim()) : [],
        question: r.question,
        answer: r.answer || r.correct_answer || '',
        explanation: r.explanation,
        difficulty: r.difficulty || 'medium',
        tags: r.tags ? r.tags.split(',').map((t: string) => t.trim()) : [],
        is_active: String(r.is_active).toLowerCase() === 'true',
        content: r.content || undefined,
      }));
      await bulkCreateShortQuestions(payload);
      toast({ title: 'Success', description: `${payload.length} short questions uploaded.` });
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Bulk upload failed', variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  const columns: ColumnDef<IShortQuestion>[] = [
    { accessorKey: 'question', header: 'Question' },
    { accessorKey: 'entity_type', header: 'Entity' },
    { accessorKey: 'difficulty', header: 'Difficulty' },
    { accessorKey: 'is_active', header: 'Status', cell: ({ row }) => <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>{row.getValue('is_active') ? 'Active' : 'Inactive'}</Badge> },
    {
      id: 'actions', header: 'Actions', cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => { setEditing(row.original); setOpenForm(true); }}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(row.original._id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminPageLayout
      title="Short Questions"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isLoading}
      data={data}
      columns={columns}
      emptyStateTitle="No short questions"
      emptyStateMessage="Create your first short question"
      emptyStateAction={<Button onClick={() => setOpenForm(true)}>Create</Button>}
    >
      <EntityFormModal open={openForm} onOpenChange={setOpenForm} title={editing ? 'Edit Short Question' : 'Create Short Question'}>
        <ShortQuestionForm onSubmit={handleCreateOrUpdate} loading={isLoading} initialData={editing || undefined} />
      </EntityFormModal>

      <CsvUploadDialog
        schema={{
          title: 'Upload Short Questions CSV',
          description: 'Columns: entity_type, entity_id, supported_language_ids, question, answer, explanation, difficulty, tags, is_active, content',
          fields: [] // reuse MCQ schema fields
        }}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { GBQuestionForm } from "@/components/entity/GBQuestionForm";
import { getGBQuestions, createGBQuestion, updateGBQuestion, deleteGBQuestion, bulkCreateGBQuestions, IGBQuestion } from "@/lib/api/entities/gbQuestions";
import { gbQuestionColumns } from '@/components/table/columns/gbQuestionColumns';
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

type GBQuestion = IGBQuestion;
type GBQuestionInput = Omit<IGBQuestion, '_id' | 'createdAt' | 'updatedAt'>;

export default function GBQuestionsPage() {
  const [selected, setSelected] = useState<GBQuestion | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GBQuestion | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [subtopics, setSubtopics] = useState<IGBSubtopic[]>([]);
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchGBQuestionsData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getGBQuestions({ page: pageNum, limit: size, search });
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
    getLanguages().then((langs) => {
      setLanguages(langs || []);
    });
    getGBSubtopics().then((subtopics) => {
      setSubtopics(subtopics.data || []);
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

  // Add action column to the columns
  const columns: ColumnDef<GBQuestion>[] = [
    ...(gbQuestionColumns as ColumnDef<GBQuestion>[]),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const question = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(question);
                setOpenModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(question)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // CSV schema for GB questions - memoized to handle dependencies
  const gbQuestionCsvSchema: CsvSchema = useMemo(() => ({
    title: "Upload GB Questions CSV",
    description: "Upload a CSV with columns: gb_subtopic_id, question, slug, answer, content, language_id, order, image, tag, source, author, difficulty_level, is_published",
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
        <GBQuestionForm initialData={selected || {}} onSubmit={handleSave} loading={isDataLoading} />
      </EntityFormModal>
      
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete GB Question"
        description={`Are you sure you want to delete GB Question "${deleteTarget?.question}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={gbQuestionCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
};

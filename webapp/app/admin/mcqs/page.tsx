"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { useLoading } from "@/hooks/use-loading";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { MCQForm } from "@/components/entity/MCQForm";
import { MCQTranslationForm } from "@/components/entity/MCQTranslationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import { getLanguages } from "@/lib/api/entities/language";

// Use the imported ILanguage from the API
import { ILanguage } from "@/lib/api/entities/language";
import { CsvUploadDialog, CsvSchema, FieldSchema } from "@/components/shared/CsvUploadDialog";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/utils/csv-utils";
import { bulkCreateMCQs } from "@/lib/api/entities/mcqs";

import {
  getMCQs,
  createMCQ,
  updateMCQ,
  deleteMCQ,
  createMCQTranslation,
  updateMCQTranslation,
  deleteMCQTranslation,
  IMCQ,
  IMCQTranslation,
} from "@/lib/api/entities/mcqs";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";

export default function MCQsPage() {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IMCQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IMCQ | null>(null);

  // Translation management
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    mcq: IMCQ;
    translation?: IMCQTranslation;
  } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{
    mcq: IMCQ;
    translation: IMCQTranslation;
  } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [openCsvUpload, setOpenCsvUpload] = useState(false);
  const { toast } = useToast();

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchMCQsData = useCallback(async (pageNum: number, size: number, search: string) => {
    try {
      console.log('Fetching MCQs with params:', { page: pageNum, limit: size, search });
      const result = await getMCQs({ page: pageNum, limit: size, search });
      console.log('MCQ API response:', result);
      
      // Handle different response structures from the API
      if (result && typeof result === 'object') {
        // If it's a paginated response
        if (result.data && Array.isArray(result.data)) {
          console.log('Using paginated response structure');
          return {
            data: result.data,
            totalPages: result.totalPages || Math.ceil((result.total || 0) / size),
            total: result.total || 0,
          };
        }
        // If it's a direct array response
        if (Array.isArray(result)) {
          console.log('Using direct array response structure');
          return {
            data: result,
            totalPages: Math.ceil(result.length / size),
            total: result.length,
          };
        }
      }
      
      // Fallback for unexpected response structure
      console.warn('Unexpected MCQ API response structure:', result);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    } catch (error: any) {
      console.error('Error fetching MCQs:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        data: [],
        totalPages: 1,
        total: 0,
      };
    }
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: mcqs,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<IMCQ>({
    fetchData: fetchMCQsData,
    pageSize: 10
  });

  const fetchLanguages = async () => {
    try {
      console.log('Fetching languages for MCQ page...');
      const languagesData: any = await getLanguages();
      console.log('Languages fetched for MCQ page:', languagesData);
      
      // Ensure we always get an array
      const languagesArray: ILanguage[] = Array.isArray(languagesData)
        ? languagesData
        : Array.isArray((languagesData as any)?.data)
        ? languagesData.data
        : [];
      
      if (!Array.isArray(languagesData) && !Array.isArray((languagesData as any)?.data)) {
        console.warn('Languages API returned non-array data:', languagesData);
      }
      
      setLanguages(languagesArray);
    } catch (error: any) {
      console.error('Failed to fetch languages:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setLanguages([]);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateMCQ(editing._id, data);
      } else {
        await createMCQ(data);
      }
      setOpenForm(false);
      setEditing(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to save MCQ:', error);
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        startLoading();
        await deleteMCQ(deleteTarget._id);
        setDeleteTarget(null);
        fetchPaginatedData(page, pageSize, searchTerm);
      } catch (error: any) {
        console.error('Failed to delete MCQ:', error);
      } finally {
        stopLoading();
      }
    }
  };

  // Translation management handlers
  const handleAddTranslation = async (mcq: IMCQ) => {
    setOpenTranslationForm({ mcq });
  };

  const handleEditTranslation = async (mcq: IMCQ, translation: IMCQTranslation) => {
    setActiveTranslationAction(translation._id ?? null);
    setOpenTranslationForm({ mcq, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { mcq, translation } = openTranslationForm;
    try {
      startLoading();
      if (translation && translation._id && mcq._id) {
        await updateMCQTranslation(mcq._id, translation._id, data);
      } else if (mcq._id) {
        await createMCQTranslation(mcq._id, data);
      } else {
        throw new Error("Missing MCQ ID");
      }
      setOpenTranslationForm(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to save translation:', error);
    } finally {
      stopLoading();
    }
  };

  const handleDeleteTranslation = (mcq: IMCQ, translation: IMCQTranslation) => {
    setActiveTranslationAction(translation._id ? translation._id : null);
    setDeleteTranslationTarget({ mcq, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { mcq, translation } = deleteTranslationTarget;
    try {
      startLoading();
      if (!mcq._id || !translation._id) {
        throw new Error("Missing MCQ or translation ID");
      }
      await deleteMCQTranslation(mcq._id, translation._id);
      setDeleteTranslationTarget(null);
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      console.error('Failed to delete translation:', error);
    } finally {
      stopLoading();
      setActiveTranslationAction(null);
    }
  };

  const renderExpandedRow = (mcq: IMCQ) => {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Question Details</h4>
          <p className="text-sm text-gray-600 mb-2">{mcq.question}</p>
          <div className="space-y-1">
            {mcq.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  option.key === mcq.correct_answer 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {option.key}
                </span>
                <span className="text-sm">{option.text}</span>
              </div>
            ))}
          </div>
          {mcq.explanation && (
            <p className="text-sm text-gray-500 mt-2">
              <strong>Explanation:</strong> {mcq.explanation}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Translations</h4>
            <Button
              size="sm"
              onClick={() => handleAddTranslation(mcq)}
              disabled={!!activeTranslationAction}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Translation
            </Button>
          </div>
          {mcq.translations && mcq.translations.length > 0 ? (
            <div className="space-y-2">
              {mcq.translations.map((translation: IMCQTranslation) => (
                <div key={translation._id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTranslation(mcq, translation)}
                        disabled={!!activeTranslationAction}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTranslation(mcq, translation)}
                        disabled={!!activeTranslationAction}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{translation.question}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No translations yet</p>
          )}
        </div>
      </div>
    );
  };

  const columns: ColumnDef<IMCQ>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue("question")}>
          {row.getValue("question")}
        </div>
      ),
    },
    {
      accessorKey: "entity_type",
      header: "Entity Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("entity_type")}</Badge>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string;
        const variant = difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive';
        return <Badge variant={variant}>{difficulty}</Badge>;
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue("tags") as string[]).slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(row.getValue("tags") as string[]).length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(row.getValue("tags") as string[]).length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "translations",
      header: "Translations",
      cell: ({ row }) => {
        const translations = row.getValue("translations") as any[];
        return (
          <div className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            <span className="text-sm">{translations?.length || 0}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row.original);
              setOpenForm(true);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  // CSV schema for MCQs
  const mcqCsvSchema: CsvSchema = {
    title: "Upload MCQs CSV",
    description: "CSV columns: entity_type, entity_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation(optional), difficulty(optional), tags(comma-separated), is_active(optional true/false), content(HTML - optional). Note: legacy 'options' JSON is still accepted.",
    fields: [
      { name: "entity_type", type: "text", required: true } as FieldSchema,
      { name: "entity_id", type: "text", required: true } as FieldSchema,
      { name: "supported_language_ids", type: "text", required: false } as FieldSchema,
      { name: "question", type: "text", required: true } as FieldSchema,
      { name: "option_a", type: "text", required: true } as FieldSchema,
      { name: "option_b", type: "text", required: true } as FieldSchema,
      { name: "option_c", type: "text", required: true } as FieldSchema,
      { name: "option_d", type: "text", required: true } as FieldSchema,
      { name: "correct_answer", type: "text", required: true } as FieldSchema,
      { name: "explanation", type: "text", required: false } as FieldSchema,
      { name: "difficulty", type: "text", required: false } as FieldSchema,
      { name: "tags", type: "text", required: false } as FieldSchema,
      { name: "is_active", type: "boolean", required: false } as FieldSchema,
      { name: "content", type: "text", required: false } as FieldSchema,
    ],
  };

  const handleBulkUpload = async (rows: any[]) => {
    try {
      startLoading();
      const payload = rows.map((r: any) => {
        let options: any[] = [];
        // Prefer new columns option_a .. option_d; fallback to legacy 'options' JSON
        const oa = r.option_a, ob = r.option_b, oc = r.option_c, od = r.option_d;
        if (oa || ob || oc || od) {
          const candidates = [
            { key: 'A', text: (oa ?? '').toString() },
            { key: 'B', text: (ob ?? '').toString() },
            { key: 'C', text: (oc ?? '').toString() },
            { key: 'D', text: (od ?? '').toString() },
          ];
          options = candidates.filter(c => c.text !== '');
        } else if (r.options) {
          try { options = JSON.parse(r.options); } catch { options = []; }
        }
        const content = r.content || undefined
        const is_active = String(r.is_active).toLowerCase() === 'true';
        const tags = typeof r.tags === 'string' && r.tags.trim() ? r.tags.split(',').map((t: string) => t.trim()) : [];
        return {
          entity_type: r.entity_type,
          entity_id: r.entity_id,
          supported_language_ids: r.supported_language_ids ? r.supported_language_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id) : [],
          question: r.question,
          options,
          correct_answer: r.correct_answer,
          explanation: r.explanation || undefined,
          difficulty: (r.difficulty || 'medium') as any,
          tags,
          is_active,
          content,
        };
      });
      const chunkSize = 500;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await bulkCreateMCQs(chunk);
      }
      toast({ title: 'Success', description: `${payload.length} MCQs uploaded successfully.` });
      fetchPaginatedData(page, pageSize, searchTerm);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to upload MCQs.', variant: 'destructive' });
    } finally {
      stopLoading();
    }
  };

  return (
    <AdminPageLayout
      title="MCQs"
      onAddClick={() => setOpenForm(true)}
      onImportClick={() => setOpenCsvUpload(true)}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search MCQs..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isLoading}
      data={mcqs}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No MCQs found"
      emptyStateMessage="Get started by creating your first MCQ."
      emptyStateAction={
        <Button onClick={() => setOpenForm(true)}>
          Create MCQ
        </Button>
      }
    >
      {/* MCQ Form Modal */}
      <EntityFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        title={editing ? "Edit MCQ" : "Create MCQ"}
      >
        <MCQForm
          onSubmit={handleCreateOrUpdate}
          loading={isLoading}
          initialData={editing || undefined}
        />
      </EntityFormModal>

      {/* MCQ Translation Form Modal */}
      <EntityFormModal
        open={!!openTranslationForm}
        onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        title={openTranslationForm?.translation ? "Edit Translation" : "Add Translation"}
      >
        {openTranslationForm && (
          <MCQTranslationForm
            onSubmit={handleTranslationSubmit}
            loading={isLoading}
            initialData={openTranslationForm.translation}
            languages={languages}
            originalMCQ={openTranslationForm.mcq}
          />
        )}
      </EntityFormModal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Delete MCQ"
        description="Are you sure you want to delete this MCQ? This action cannot be undone."
        onConfirm={handleDelete}
      />

      {/* Delete Translation Confirmation */}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        onCancel={() => setDeleteTranslationTarget(null)}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        onConfirm={confirmDeleteTranslation}
      />

      {/* CSV Upload Dialog */}
      <CsvUploadDialog
        schema={mcqCsvSchema}
        open={openCsvUpload}
        onOpenChange={setOpenCsvUpload}
        onUpload={handleBulkUpload}
      />
    </AdminPageLayout>
  );
} 
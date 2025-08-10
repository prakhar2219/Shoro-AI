"use client";

import React from "react";
import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { useLoading } from "@/hooks/use-loading";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { MCQForm } from "@/components/entity/MCQForm";
import { MCQTranslationForm } from "@/components/entity/MCQTranslationForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import { getLanguages } from "@/lib/api/entities/language";

// Use the imported ILanguage from the API
import { ILanguage } from "@/lib/api/entities/language";

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

export default function MCQsPage() {
  const [mcqs, setMCQs] = useState<IMCQ[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IMCQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IMCQ | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
  const { toast } = useToast();

  const fetchMCQs = async () => {
    try {
      startLoading();
      const result = await getMCQs({ page, limit, search: searchTerm });
      setMCQs(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch MCQs",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const fetchLanguages = async () => {
    try {
      const languagesData = await getLanguages();
      setLanguages(languagesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch languages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    fetchMCQs();
  }, [page, limit, searchTerm]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateMCQ(editing._id, data);
        toast({
          title: "Success",
          description: "MCQ updated successfully.",
        });
      } else {
        await createMCQ(data);
        toast({
          title: "Success",
          description: "MCQ created successfully.",
        });
      }
      setOpenForm(false);
      setEditing(null);
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save MCQ",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        startLoading();
        await deleteMCQ(deleteTarget._id);
        toast({
          title: "Success",
          description: "MCQ deleted successfully.",
        });
        setDeleteTarget(null);
        fetchMCQs();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete MCQ",
          variant: "destructive",
        });
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
        toast({ title: "Success", description: "Translation updated." });
      } else if (mcq._id) {
        await createMCQTranslation(mcq._id, data);
        toast({ title: "Success", description: "Translation added." });
      } else {
        throw new Error("Missing MCQ ID");
      }
      setOpenTranslationForm(null);
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save translation",
        variant: "destructive",
      });
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
      toast({ title: "Success", description: "Translation deleted." });
      setDeleteTranslationTarget(null);
      fetchMCQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete translation",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto py-6">
      {isLoading && <LoadingOverlay />}
      
      <PageTitleWithActions
        title="MCQs"
        onAddClick={() => setOpenForm(true)}
      />

      <div className="mt-6">
        <SearchBar
          placeholder="Search MCQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-6">
        {mcqs.length === 0 ? (
          <EmptyState
            title="No MCQs found"
            message="Get started by creating your first MCQ."
            action={
              <Button onClick={() => setOpenForm(true)}>
                Create MCQ
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={mcqs}
            renderExpandedRow={renderExpandedRow}
            page={page - 1}
            totalPages={totalPages}
            setPage={(newPage) => setPage(newPage + 1)}
          />
        )}
      </div>

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
        // loading={isLoading}
      />

      {/* Delete Translation Confirmation */}
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        onCancel={() => setDeleteTranslationTarget(null)}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        onConfirm={confirmDeleteTranslation}
        // loading={isLoading}
      />
    </div>
  );
} 
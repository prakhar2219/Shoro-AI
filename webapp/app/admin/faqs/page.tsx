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
import { FAQForm } from "@/components/entity/FAQForm";
import { FAQTranslationForm } from "@/components/entity/FAQTranslationForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Languages } from "lucide-react";
import { getLanguages } from "@/lib/api/entities/language";
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  createFAQTranslation,
  updateFAQTranslation,
  deleteFAQTranslation,
  IFAQ,
  IFAQTranslation,
} from "@/lib/api/entities/faqs";
import { ILanguage } from "@/lib/api/entities/language";

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IFAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IFAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Translation management
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    faq: IFAQ;
    translation?: IFAQTranslation;
  } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{
    faq: IFAQ;
    translation: IFAQTranslation;
  } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const fetchFAQs = async () => {
    try {
      startLoading();
      const result = await getFAQs({ page, limit, search: searchTerm });
      setFaqs(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch FAQs",
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
    fetchFAQs();
  }, [page, limit, searchTerm]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateFAQ(editing._id, data);
        toast({
          title: "Success",
          description: "FAQ updated successfully.",
        });
      } else {
        await createFAQ(data);
        toast({
          title: "Success",
          description: "FAQ created successfully.",
        });
      }
      setOpenForm(false);
      setEditing(null);
      fetchFAQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save FAQ",
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
        await deleteFAQ(deleteTarget._id);
        toast({
          title: "Success",
          description: "FAQ deleted successfully.",
        });
        setDeleteTarget(null);
        fetchFAQs();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to delete FAQ",
          variant: "destructive",
        });
      } finally {
        stopLoading();
      }
    }
  };

  // Translation management handlers
  const handleAddTranslation = async (faq: IFAQ) => {
    setOpenTranslationForm({ faq });
  };

  const handleEditTranslation = async (faq: IFAQ, translation: IFAQTranslation) => {
    setActiveTranslationAction(translation._id ?? null);
    setOpenTranslationForm({ faq, translation });
    setTimeout(() => setActiveTranslationAction(null), 500);
  };

  const handleTranslationSubmit = async (data: any) => {
    if (!openTranslationForm) return;
    const { faq, translation } = openTranslationForm;
    try {
      startLoading();
      if (translation && translation._id) {
        await updateFAQTranslation(faq._id!, translation._id, data);
        toast({ title: "Success", description: "Translation updated." });
      } else {
        await createFAQTranslation(faq._id!, data);
        toast({ title: "Success", description: "Translation added." });
      }
      setOpenTranslationForm(null);
      fetchFAQs();
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

  const handleDeleteTranslation = (faq: IFAQ, translation: IFAQTranslation) => {
    setActiveTranslationAction(translation._id ?? null);
    setDeleteTranslationTarget({ faq, translation });
  };

  const confirmDeleteTranslation = async () => {
    if (!deleteTranslationTarget) return;
    const { faq, translation } = deleteTranslationTarget;
    try {
      startLoading();
      await deleteFAQTranslation(faq._id!, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      setDeleteTranslationTarget(null);
      fetchFAQs();
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

  const renderExpandedRow = (faq: IFAQ) => {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h4 className="font-semibold mb-2">FAQ Details</h4>
          <p className="text-sm text-gray-600 mb-2">{faq.question}</p>
          <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
          {faq.category && (
            <Badge variant="outline" className="mt-2">
              {faq.category}
            </Badge>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Translations</h4>
            <Button
              size="sm"
              onClick={() => handleAddTranslation(faq)}
              disabled={!!activeTranslationAction}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Translation
            </Button>
          </div>
          {faq.translations && faq.translations.length > 0 ? (
            <div className="space-y-2">
              {faq.translations.map((translation: IFAQTranslation) => (
                <div key={translation._id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTranslation(faq, translation)}
                        disabled={!!activeTranslationAction}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTranslation(faq, translation)}
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

  const columns: ColumnDef<IFAQ>[] = [
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return category ? (
          <Badge variant="secondary">{category}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("order")}</span>
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
        title="FAQs"
        onAddClick={() => setOpenForm(true)}
      />

      <div className="mt-6">
        <SearchBar
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-6">
        {faqs.length === 0 ? (
          <EmptyState
            title="No FAQs found"
            message="Get started by creating your first FAQ."
            action={
              <Button onClick={() => setOpenForm(true)}>
                Create FAQ
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={faqs}
            renderExpandedRow={renderExpandedRow}
            page={page - 1}
            totalPages={totalPages}
            setPage={(newPage) => setPage(newPage + 1)}
          />
        )}
      </div>

      {/* FAQ Form Modal */}
      <EntityFormModal
        open={openForm}
        onOpenChange={setOpenForm}
        title={editing ? "Edit FAQ" : "Create FAQ"}
      >
        <FAQForm
          onSubmit={handleCreateOrUpdate}
          loading={isLoading}
          initialData={editing || undefined}
        />
      </EntityFormModal>

      {/* FAQ Translation Form Modal */}
      <EntityFormModal
        open={!!openTranslationForm}
        onOpenChange={(open) => !open && setOpenTranslationForm(null)}
        title={openTranslationForm?.translation ? "Edit Translation" : "Add Translation"}
      >
        {openTranslationForm && (
          <FAQTranslationForm
            onSubmit={handleTranslationSubmit}
            loading={isLoading}
            initialData={openTranslationForm.translation}
            languages={languages}
          />
        )}
      </EntityFormModal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
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
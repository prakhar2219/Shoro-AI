"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FAQForm } from "./FAQForm";
import { FAQTranslationForm } from "./FAQTranslationForm";
import dynamic from "next/dynamic";

// Dynamically import icons to prevent hydration issues
const Edit = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Edit })), { ssr: false });
const Trash2 = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Trash2 })), { ssr: false });
const Plus = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Plus })), { ssr: false });
const Languages = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Languages })), { ssr: false });
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/hooks/use-loading";
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
import { getLanguages } from "@/lib/api/entities/language";
import { ILanguage } from "@/lib/api/entities/language";

interface FAQSectionProps {
  entityType: string;
  entityId: string;
  entityName?: string;
}

export function FAQSection({ entityType, entityId, entityName }: FAQSectionProps) {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<IFAQ | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IFAQ | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{
    faq: IFAQ;
    translation?: IFAQTranslation;
  } | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoading();
  const { toast } = useToast();

  const fetchFAQs = async () => {
    try {
      console.log('Fetching FAQs with:', { entity_type: entityType, entity_id: entityId });
      const result = await getFAQs({ entity_type: entityType, entity_id: entityId });
      console.log('FAQ API response:', result);
      setFaqs(result.data || result);
    } catch (error: any) {
      console.error('FAQ fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch FAQs",
        variant: "destructive",
      });
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
    fetchFAQs();
    fetchLanguages();
  }, [entityType, entityId]);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      startLoading();
      if (editing?._id) {
        await updateFAQ(editing._id, data);
        toast({ title: "Success", description: "FAQ updated successfully." });
      } else {
        await createFAQ({ ...data, entity_type: entityType, entity_id: entityId });
        toast({ title: "Success", description: "FAQ created successfully." });
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
        toast({ title: "Success", description: "FAQ deleted successfully." });
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

  const handleDeleteTranslation = async (faq: IFAQ, translation: IFAQTranslation) => {
    try {
      startLoading();
      await deleteFAQTranslation(faq._id!, translation._id!);
      toast({ title: "Success", description: "Translation deleted." });
      fetchFAQs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete translation",
        variant: "destructive",
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>FAQs ({faqs.length})</CardTitle>
          <Button size="sm" onClick={() => setOpenForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add FAQ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {faqs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No FAQs found</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{faq.question}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {faq.category && (
                        <Badge variant="outline">{faq.category}</Badge>
                      )}
                      <Badge variant="secondary">Order: {faq.order}</Badge>
                      <div className="flex items-center gap-1">
                        <Languages className="h-3 w-3" />
                        <span className="text-xs">{faq.translations?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(faq);
                        setOpenForm(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(faq)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* FAQ Answer */}
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Answer:</span> {faq.answer}
                  </p>
                </div>

                {/* Translations */}
                {faq.translations && faq.translations.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Translations</h5>
                    <div className="space-y-2">
                      {faq.translations.map((translation: IFAQTranslation) => (
                        <div key={translation._id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {languages.find(l => l._id === translation.language_id)?.name || translation.language_id}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTranslation(faq, translation)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-gray-600">{translation.question}</p>
                          <p className="text-gray-500 text-xs mt-1">{translation.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Translation Button */}
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenTranslationForm({ faq })}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Translation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ Form Modal */}
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit FAQ" : "Create FAQ"} {entityName && `for ${entityName}`}
              </DialogTitle>
            </DialogHeader>
            <FAQForm
              onSubmit={handleCreateOrUpdate}
              loading={isLoading}
              initialData={editing || undefined}
              entityType={entityType}
              entityId={entityId}
            />
          </DialogContent>
        </Dialog>

        {/* FAQ Translation Form Modal */}
        <Dialog open={!!openTranslationForm} onOpenChange={(open) => !open && setOpenTranslationForm(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Translation</DialogTitle>
            </DialogHeader>
            {openTranslationForm && (
              <FAQTranslationForm
                onSubmit={handleTranslationSubmit}
                loading={isLoading}
                languages={languages}
                initialData={openTranslationForm.translation}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {deleteTarget && (
          <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete FAQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete this FAQ? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? "Deleting..." : "Delete"}
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
} 
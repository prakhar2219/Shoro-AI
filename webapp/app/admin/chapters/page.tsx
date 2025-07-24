"use client";

import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { ChapterCard } from "@/components/entity/ChapterCard";
import Link from "next/link";
import { getChapters, createChapter, updateChapter, deleteChapter } from "@/lib/api/entities/chapters";
import { DataTable } from '@/components/ui/DataTable';
import { chapterColumns } from '@/components/table/columns/chapterColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { ChapterTranslationForm } from '@/components/entity/ChapterTranslationForm';
import { api } from '@/lib/api/axios';

type Chapter = any;

type ChapterInput = any;

export default function ChapterAdminPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ chapter: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ chapter: any; translation: any } | null>(null);
  // translationsMap is no longer needed; translations are now included in the BE response
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line
  }, [page, limit]);

  useEffect(() => {
    getLanguages().then((langs) => {
      setLanguages(langs || []);
      setLanguageIdMap(Object.fromEntries((langs || []).map(l => [l._id || l.code, l.name])));
    });
  }, []);

  // Remove translationsMap and related useEffect

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const result = await getChapters({ page, limit });
      setChapters(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (e) {
      setChapters([]);
      setTotal(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handleSave = async (data: ChapterInput) => {
    setLoading(true);
    try {
      if (selected && selected._id) await updateChapter(selected._id, data);
      else await createChapter(data);
      await fetchChapters();
    } finally {
      setOpenModal(false);
      setSelected(null);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      setLoading(true);
      try {
        await deleteChapter(deleteTarget._id);
        await fetchChapters();
      } finally {
        setDeleteTarget(null);
        setLoading(false);
      }
    }
  };

  const handleAddTranslation = (chapter: any) => {
    setOpenTranslationForm({ chapter });
  };
  const handleEditTranslation = (chapter: any, translation: any) => {
    setOpenTranslationForm({ chapter, translation });
  };
  const handleDeleteTranslation = (chapter: any, translation: any) => {
    setDeleteTranslationTarget({ chapter, translation });
  };
  const confirmDeleteTranslation = async () => {
    if (deleteTranslationTarget) {
      setActiveTranslationAction(deleteTranslationTarget.translation._id);
      await api.delete(`/content/chapters/${deleteTranslationTarget.chapter._id}/translations/${deleteTranslationTarget.translation._id}`);
      await fetchChapters();
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/chapters/${openTranslationForm.chapter._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/chapters/${openTranslationForm?.chapter?._id}/translations`, data);
      }
      await fetchChapters();
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
    setLoading(false);
  };

  const renderExpandedRow = (chapter: any) => {
    const translations = chapter.translations || [];
    return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Translations</span>
          <button
            className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center"
            onClick={() => handleAddTranslation(chapter)}
          >
            <span className="flex items-center gap-1">+ Add Translation</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-200 dark:border-zinc-700 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Language</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Title</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Slug</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">SEO Title</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Needs Review</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">AI</th>
                <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {translations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-center text-xs text-zinc-500">
                    No translations available.
                  </td>
                </tr>
              ) : (
                translations.map((t: any) => (
                  <tr key={t._id || t.id} className="border-b border-zinc-200 dark:border-zinc-700">
                    <td className="px-4 py-2 text-xs">{languageIdMap[t.language_id] || t.language_id || '-'}</td>
                    <td className="px-4 py-2 text-xs">{t.title || '-'}</td>
                    <td className="px-4 py-2 text-xs">{t.slug || '-'}</td>
                    <td className="px-4 py-2 text-xs">{t.seo_title || '-'}</td>
                    <td className="px-4 py-2 text-xs">{t.needs_review ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 text-xs">{t.translated_by_ai ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          onClick={() => handleEditTranslation(chapter, t)}
                          tabIndex={0}
                          aria-label="Edit Translation"
                        >
                          Edit
                          {activeTranslationAction === t._id && loading && (
                            <span className="ml-1 animate-spin">...</span>
                          )}
                        </button>
                        <button
                          className="text-red-600 hover:underline text-xs flex items-center gap-1"
                          onClick={() => handleDeleteTranslation(chapter, t)}
                          tabIndex={0}
                          aria-label="Delete Translation"
                        >
                          Delete
                          {activeTranslationAction === t._id && loading && (
                            <span className="ml-1 animate-spin">...</span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Add actions column to columns
  const columns = [
    ...chapterColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <button className="btn btn-xs btn-secondary" onClick={() => {
            setSelected(row.original);
            setOpenModal(true);
          }}>Edit</button>
          <button className="btn btn-xs btn-danger" onClick={() => setDeleteTarget(row.original)}>Delete</button>
        </div>
      ),
    },
  ];

  // DataTable expects 0-based page
  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1); // DataTable uses 0-based, API uses 1-based
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitleWithActions
        title="Chapters"
        onAddClick={() => {
          setSelected(null);
          setOpenModal(true);
        }}
      />
      {loading ? (
        <div>Loading...</div>
      ) : chapters.length === 0 ? (
        <EmptyState title="No chapters found" />
      ) : (
        <DataTable
          columns={columns}
          data={chapters}
          renderExpandedRow={renderExpandedRow}
          page={page - 1}
          setPage={handlePageChange}
          totalPages={totalPages}
        />
      )}
      <EntityFormModal
        title={selected ? "Edit Chapter" : "Add Chapter"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <ChapterForm initialData={selected || {}} onSubmit={handleSave} loading={loading} />
      </EntityFormModal>
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Chapter"
        description={`Are you sure you want to delete Chapter #${deleteTarget?.order}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      <EntityFormModal
        title={openTranslationForm?.translation ? "Edit Translation" : "Add Translation"}
        open={!!openTranslationForm}
        onOpenChange={(open) => { if (!open) setOpenTranslationForm(open ? openTranslationForm : null); }}
      >
        {openTranslationForm && (
          <ChapterTranslationForm
            initialData={openTranslationForm.translation || {}}
            onSubmit={handleTranslationSubmit}
            loading={loading}
            languages={languages.filter(l => l._id).map(l => ({ _id: l._id || l.code, name: l.name, code: l.code }))}
          />
        )}
      </EntityFormModal>
      <ConfirmationDialog
        open={!!deleteTranslationTarget}
        title="Delete Translation"
        description={`Are you sure you want to delete translation for Chapter #${deleteTranslationTarget?.chapter?.order}?`}
        onCancel={() => setDeleteTranslationTarget(null)}
        onConfirm={confirmDeleteTranslation}
      />
    </div>
  );
} 
"use client";

import { useEffect, useState, useCallback } from "react";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { ChapterCard } from "@/components/entity/ChapterCard";
import Link from "next/link";
import { getChapters, createChapter, updateChapter, deleteChapter } from "@/lib/api/entities/chapters";
import { chapterColumns } from '@/components/table/columns/chapterColumns';
import { getLanguages, ILanguage } from '@/lib/api/entities/language';
import { ChapterTranslationForm } from '@/components/entity/ChapterTranslationForm';
import { api } from '@/lib/api/axios';
import { EntityActionDropdown } from "@/components/shared/EntityActionDropdown";
import { AdminPageLayout } from "@/components/shared/AdminPageLayout";
import { TranslationManagementSection } from "@/components/shared/TranslationManagementSection";
import { GlobalContentManagement } from "@/components/shared/GlobalContentManagement";
import { ContentFormModals } from "@/components/shared/ContentFormModals";
import { useAdminPage } from "@/hooks/use-admin-page";
import { ColumnDef } from "@tanstack/react-table";

type Chapter = any;

type ChapterInput = any;

export default function ChapterAdminPage() {
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [openTranslationForm, setOpenTranslationForm] = useState<{ chapter: any; translation?: any } | null>(null);
  const [deleteTranslationTarget, setDeleteTranslationTarget] = useState<{ chapter: Chapter; translation: any } | null>(null);
  const [activeTranslationAction, setActiveTranslationAction] = useState<string | null>(null);

  // Content modal states
  const [openMCQModal, setOpenMCQModal] = useState(false);
  const [openFAQModal, setOpenFAQModal] = useState(false);
  const [openDescriptiveQuestionModal, setOpenDescriptiveQuestionModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; name: string } | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [languageIdMap, setLanguageIdMap] = useState<Record<string, string>>({});

  // Wrap fetchData in useCallback to prevent infinite loop
  const fetchChaptersData = useCallback(async (pageNum: number, size: number, search: string) => {
    const result = await getChapters({ page: pageNum, limit: size });
    return {
      data: result.data || [],
      totalPages: result.totalPages || 1,
      total: result.total || 0,
    };
  }, []);

  // Use the custom hook for common admin page functionality
  const {
    data: chapters,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    isLoading: isDataLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
  } = useAdminPage<Chapter>({
    fetchData: fetchChaptersData,
    pageSize: 10
  });

  useEffect(() => {
    getLanguages().then((langs) => {
      setLanguages(langs || []);
      setLanguageIdMap(Object.fromEntries((langs || []).map(l => [l._id || l.code, l.name])));
    });
  }, []);

  const handleSave = async (data: ChapterInput) => {
    try {
      if (selected && selected._id) await updateChapter(selected._id, data);
      else await createChapter(data);
      await fetchPaginatedData(page, pageSize, searchTerm);
    } finally {
      setOpenModal(false);
      setSelected(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget?._id) {
      try {
        await deleteChapter(deleteTarget._id);
        await fetchPaginatedData(page, pageSize, searchTerm);
      } finally {
        setDeleteTarget(null);
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
      await fetchPaginatedData(page, pageSize, searchTerm);
      setDeleteTranslationTarget(null);
      setActiveTranslationAction(null);
    }
  };

  const handleTranslationSubmit = async (data: any) => {
    try {
      if (openTranslationForm?.translation && openTranslationForm.translation._id) {
        // Edit
        await api.put(`/content/chapters/${openTranslationForm.chapter._id}/translations/${openTranslationForm.translation._id}`, data);
      } else {
        // Add
        await api.post(`/content/chapters/${openTranslationForm?.chapter?._id}/translations`, data);
      }
      await fetchPaginatedData(page, pageSize, searchTerm);
      setOpenTranslationForm(null);
    } catch (e) {
      // Optionally show error toast
    }
  };

  const renderExpandedRow = (chapter: any) => {
    const translations = chapter.translations || [];
    return (
      <TranslationManagementSection
        translations={translations}
        languageMap={languageIdMap}
        onAddTranslation={() => handleAddTranslation(chapter)}
        onEditTranslation={(translation) => handleEditTranslation(chapter, translation)}
        onDeleteTranslation={(translation) => handleDeleteTranslation(chapter, translation)}
        activeTranslationAction={activeTranslationAction}
        isLoading={isDataLoading}
        entityName="Chapter"
      />
    );
  };

  // Add actions column to columns
  const columns: ColumnDef<Chapter>[] = [
    ...chapterColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <EntityActionDropdown
          entity={row.original}
          entityType="Chapter"
          onEdit={() => {
            setSelected(row.original);
            setOpenModal(true);
          }}
          onDelete={() => setDeleteTarget(row.original)}
          onAddMCQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenMCQModal(true);
          }}
          onAddFAQ={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenFAQModal(true);
          }}
          onAddDescriptiveQuestion={(entityId) => {
            setSelectedEntity({ id: entityId, name: row.original.title });
            setOpenDescriptiveQuestionModal(true);
          }}
        />
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Chapters"
      onAddClick={() => {
        setSelected(null);
        setOpenModal(true);
      }}
      searchTerm={searchTerm}
      onSearchChange={handleSearchInputChange}
      searchPlaceholder="Search chapters..."
      pageSize={pageSize}
      onPageSizeChange={handlePageSizeChange}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      isLoading={isDataLoading}
      data={chapters}
      columns={columns}
      renderExpandedRow={renderExpandedRow}
      emptyStateTitle="No chapters found"
      emptyStateMessage="There are no chapters yet. Try adding one."
      emptyStateAction={
        <button className="btn btn-primary mt-2" onClick={() => setOpenModal(true)}>
          Add Chapter
        </button>
      }
    >
      {/* Modals and dialogs */}
      <EntityFormModal
        title={selected ? "Edit Chapter" : "Add Chapter"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <ChapterForm initialData={selected || {}} onSubmit={handleSave} loading={isDataLoading} />
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
            loading={isDataLoading}
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

      {/* Content Form Modals */}
      <ContentFormModals
        selectedEntity={selectedEntity}
        openMCQModal={openMCQModal}
        setOpenMCQModal={setOpenMCQModal}
        openFAQModal={openFAQModal}
        setOpenFAQModal={setOpenFAQModal}
        openDescriptiveQuestionModal={openDescriptiveQuestionModal}
        setOpenDescriptiveQuestionModal={setOpenDescriptiveQuestionModal}
        entityType="Chapter"
      />

      {/* Global Content Management for All Chapters */}
      <GlobalContentManagement
        entityType="Chapter"
        entityId=""
        entityName="All Chapters"
      />
    </AdminPageLayout>
  );
} 
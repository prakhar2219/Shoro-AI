"use client";

import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { ChapterCard } from "@/components/entity/ChapterCard";
import Link from "next/link";

type Chapter = any;

type ChapterInput = any;

const initialChapters: Chapter[] = [
  { id: "1", order: 1, subject_id: "1", is_published: true, created_by: "user1" },
  { id: "2", order: 2, subject_id: "1", is_published: false, created_by: "user2" },
];

export default function ChapterAdminPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    // const result = await getChapters();
    setChapters(initialChapters);
  };

  const handleSave = async (data: ChapterInput) => {
    // if (selected) await updateChapter(selected.id, data);
    // else await createChapter(data);
    fetchChapters();
    setOpenModal(false);
    setSelected(null);
  };

  const handleDelete = async () => {
    // if (deleteTarget?.id) await deleteChapter(deleteTarget.id);
    setDeleteTarget(null);
    fetchChapters();
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
      {chapters.length === 0 ? (
        <EmptyState title="No chapters found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <Link key={chapter.id} href={`/admin/chapters/${chapter.id}`}>
              <ChapterCard
                chapter={chapter}
                onEdit={() => {
                  setSelected(chapter);
                  setOpenModal(true);
                }}
                onDelete={() => setDeleteTarget(chapter)}
              />
            </Link>
          ))}
        </div>
      )}
      <EntityFormModal
        title={selected ? "Edit Chapter" : "Add Chapter"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <ChapterForm initialData={selected} onSubmit={handleSave} />
      </EntityFormModal>
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Chapter"
        description={`Are you sure you want to delete Chapter #${deleteTarget?.order}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 
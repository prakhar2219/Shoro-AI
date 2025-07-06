"use client";

import { useEffect, useState } from "react";
import { PageTitleWithActions } from "@/components/shared/PageTitleWithActions";
import { EntityFormModal } from "@/components/shared/EntityFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SubjectForm } from "@/components/entity/SubjectForm";
import { SubjectCard } from "@/components/entity/SubjectCard";
import Link from "next/link";

type Subject = any;

type SubjectInput = any;

const initialSubjects: Subject[] = [
  { id: "1", name: "Mathematics", code: "MATH", icon: "📐", class_id: "1" },
  { id: "2", name: "Science", code: "SCI", icon: "🔬", class_id: "1" },
];

export default function SubjectAdminPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    // const result = await getSubjects();
    setSubjects(initialSubjects);
  };

  const handleSave = async (data: SubjectInput) => {
    // if (selected) await updateSubject(selected.id, data);
    // else await createSubject(data);
    fetchSubjects();
    setOpenModal(false);
    setSelected(null);
  };

  const handleDelete = async () => {
    // if (deleteTarget?.id) await deleteSubject(deleteTarget.id);
    setDeleteTarget(null);
    fetchSubjects();
  };

  return (
    <div className="p-6 space-y-6">
      <PageTitleWithActions
        title="Subjects"
        onAddClick={() => {
          setSelected(null);
          setOpenModal(true);
        }}
      />
      {subjects.length === 0 ? (
        <EmptyState title="No subjects found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/admin/subjects/${subject.id}`}>
              <SubjectCard
                subject={subject}
                onEdit={() => {
                  setSelected(subject);
                  setOpenModal(true);
                }}
                onDelete={() => setDeleteTarget(subject)}
              />
            </Link>
          ))}
        </div>
      )}
      <EntityFormModal
        title={selected ? "Edit Subject" : "Add Subject"}
        open={openModal}
        onOpenChange={setOpenModal}
      >
        <SubjectForm initialData={selected} onSubmit={handleSave} />
      </EntityFormModal>
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Subject"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
} 
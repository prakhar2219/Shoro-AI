"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { SubjectCard } from "@/components/entity/SubjectCard";
import Link from "next/link";

const dummySubject = {
  id: "1",
  name: "Mathematics",
  code: "MATH",
  icon: "📐",
  class_id: "1",
  translations: [
    { id: "t1", language: "en", name: "Mathematics" },
    { id: "t2", language: "es", name: "Matemáticas" },
  ],
};

export default function SubjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [subject] = useState(dummySubject); // Replace with fetch logic

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subject Detail</h1>
        <Link href={`/admin/subjects/${subject.id}/edit`} className="btn btn-secondary">
          Edit Subject
        </Link>
      </div>
      <SubjectCard subject={subject} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {subject.translations.map((t) => (
            <div key={t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language}:</span> {t.name}
              </div>
              <Link
                href={`/admin/subjects/${subject.id}/translations/${t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/subjects/${subject.id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
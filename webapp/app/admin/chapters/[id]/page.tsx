"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ChapterCard } from "@/components/entity/ChapterCard";
import Link from "next/link";

const dummyChapter = {
  id: "1",
  order: 1,
  subject_id: "1",
  is_published: true,
  created_by: "user1",
  translations: [
    { id: "t1", language: "en", title: "Introduction" },
    { id: "t2", language: "es", title: "Introducción" },
  ],
};

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [chapter] = useState(dummyChapter); // Replace with fetch logic

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chapter Detail</h1>
        <Link href={`/admin/chapters/${chapter.id}/edit`} className="btn btn-secondary">
          Edit Chapter
        </Link>
      </div>
      <ChapterCard chapter={chapter} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {chapter.translations.map((t) => (
            <div key={t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language}:</span> {t.title}
              </div>
              <Link
                href={`/admin/chapters/${chapter.id}/translations/${t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/chapters/${chapter.id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
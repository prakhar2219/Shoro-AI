"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ClassCard } from "@/components/entity/ClassCard";
import Link from "next/link";

const dummyClass = {
  id: "1",
  name: "Class 1",
  code: "C1",
  board_id: "B1",
  translations: [
    { id: "t1", language: "en", name: "Class 1" },
    { id: "t2", language: "hi", name: "कक्षा 1" },
  ],
};

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [classItem] = useState(dummyClass); // Replace with fetch logic

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Class Detail</h1>
        <Link href={`/admin/classes/${classItem.id}/edit`} className="btn btn-secondary">
          Edit Class
        </Link>
      </div>
      <ClassCard classItem={classItem} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {classItem.translations.map((t) => (
            <div key={t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language}:</span> {t.name}
              </div>
              <Link
                href={`/admin/classes/${classItem.id}/translations/${t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/classes/${classItem.id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
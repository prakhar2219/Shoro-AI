"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { BoardCard } from "@/components/entity/BoardCard";
import Link from "next/link";

const dummyBoard = {
  id: "1",
  name: "CBSE",
  short_code: "CBSE",
  country_id: "IN",
  description: "Central Board of Secondary Education",
  translations: [
    { id: "t1", language: "en", name: "CBSE" },
    { id: "t2", language: "hi", name: "सीबीएसई" },
  ],
};

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [board] = useState(dummyBoard); // Replace with fetch logic

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Board Detail</h1>
        <Link href={`/admin/boards/${board.id}/edit`} className="btn btn-secondary">
          Edit Board
        </Link>
      </div>
      <BoardCard board={board} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {board.translations.map((t) => (
            <div key={t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language}:</span> {t.name}
              </div>
              <Link
                href={`/admin/boards/${board.id}/translations/${t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/boards/${board.id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
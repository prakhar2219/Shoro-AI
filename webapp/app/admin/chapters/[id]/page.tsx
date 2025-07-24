"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChapterCard } from "@/components/entity/ChapterCard";
import Link from "next/link";
import { getChapters } from '@/lib/api/entities/chapters';
import { getChapterTranslations, deleteChapterTranslation } from '@/lib/api/entities/chapterTranslations';

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [chapter, setChapter] = useState<any>(null);
  const [translations, setTranslations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch chapter by id (from paginated or direct endpoint)
      const all = await getChapters();
      const found = (all.data || all).find((c: any) => c._id === params.id);
      setChapter(found);
      // Fetch translations
      const tr = await getChapterTranslations(params.id as string);
      setTranslations(tr);
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleDeleteTranslation = async (slug: string) => {
    setDeleting(slug);
    await deleteChapterTranslation(slug);
    // Refresh translations
    const tr = await getChapterTranslations(params.id as string);
    setTranslations(tr);
    setDeleting(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!chapter) return <div>Chapter not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chapter Detail</h1>
        <Link href={`/admin/chapters/${chapter._id}/edit`} className="btn btn-secondary">
          Edit Chapter
        </Link>
      </div>
      <ChapterCard chapter={chapter} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {translations.map((t) => (
            <div key={t._id || t.slug} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language_id?.name || t.language_id || t.language}:</span> {t.title}
              </div>
              <Link
                href={`/admin/chapters/${chapter._id}/translations/${t.slug || t._id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
              <button
                className="btn btn-xs btn-danger"
                disabled={deleting === (t.slug || t._id)}
                onClick={() => handleDeleteTranslation(t.slug || t._id)}
              >
                {deleting === (t.slug || t._id) ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/chapters/${chapter._id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
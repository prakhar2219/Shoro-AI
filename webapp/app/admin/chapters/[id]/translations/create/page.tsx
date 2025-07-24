"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChapterTranslationForm } from '@/components/entity/ChapterTranslationForm';
import { createChapterTranslation } from '@/lib/api/entities/chapterTranslations';
import { getLanguages } from '@/lib/api/entities/language';

export default function CreateChapterTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    getLanguages().then(setLanguages);
  }, []);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    await createChapterTranslation({
      ...data,
      chapter_id: params.id,
    });
    setLoading(false);
    router.push(`/admin/chapters/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Chapter Translation</h1>
      <ChapterTranslationForm onSubmit={handleSubmit} loading={loading} languages={languages} />
    </div>
  );
} 
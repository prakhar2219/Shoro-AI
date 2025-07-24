"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChapterTranslationForm } from '@/components/entity/ChapterTranslationForm';
import { getChapterTranslation, updateChapterTranslation } from '@/lib/api/entities/chapterTranslations';
import { getLanguages } from '@/lib/api/entities/language';

export default function EditChapterTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<any>(null);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getChapterTranslation(params.translationId as string),
      getLanguages(),
    ]).then(([data, langs]) => {
      setTranslation(data);
      setLanguages(langs);
      setLoading(false);
    });
  }, [params.translationId]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    await updateChapterTranslation(params.translationId as string, data);
    setLoading(false);
    router.push(`/admin/chapters/${params.id}`);
  };

  if (!translation) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Chapter Translation</h1>
      <ChapterTranslationForm initialData={translation} onSubmit={handleSubmit} loading={loading} languages={languages} />
    </div>
  );
} 
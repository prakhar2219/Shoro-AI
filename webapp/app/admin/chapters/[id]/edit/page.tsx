"use client";

import { useRouter, useParams } from "next/navigation";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { useState } from "react";

const dummyChapter = {
  id: "1",
  order: 1,
  subject_id: "1",
  is_published: true,
  created_by: "user1",
};

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [chapter] = useState(dummyChapter); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateChapter(params.id, data);
    setLoading(false);
    router.push(`/admin/chapters/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Chapter</h1>
      <ChapterForm initialData={chapter} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
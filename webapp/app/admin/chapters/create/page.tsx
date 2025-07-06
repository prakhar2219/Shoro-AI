"use client";

import { useRouter } from "next/navigation";
import { ChapterForm } from "@/components/entity/ChapterForm";
import { useState } from "react";

export default function CreateChapterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await createChapter(data);
    setLoading(false);
    router.push("/admin/chapters");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Chapter</h1>
      <ChapterForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
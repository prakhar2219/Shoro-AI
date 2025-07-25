"use client";

import { useRouter } from "next/navigation";
import { SubjectForm } from "@/components/entity/SubjectForm";
import { useState } from "react";

export default function CreateSubjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await createSubject(data);
    setLoading(false);
    router.push("/admin/subjects");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Subject</h1>
      <SubjectForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
"use client";

import { useRouter, useParams } from "next/navigation";
import { SubjectForm } from "@/components/entity/SubjectForm";
import { useState } from "react";

const dummySubject = {
  id: "1",
  name: "Mathematics",
  code: "MATH",
  icon: "📐",
  class_id: "1",
};

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [subject] = useState(dummySubject); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateSubject(params.id, data);
    setLoading(false);
    router.push(`/admin/subjects/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Subject</h1>
      <SubjectForm initialData={subject} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
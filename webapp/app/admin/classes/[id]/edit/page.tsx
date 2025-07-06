"use client";

import { useRouter, useParams } from "next/navigation";
import { ClassForm } from "@/components/entity/ClassForm";
import { useState } from "react";

const dummyClass = {
  id: "1",
  name: "Class 1",
  code: "C1",
  board_id: "B1",
};

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [classItem] = useState(dummyClass); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateClass(params.id, data);
    setLoading(false);
    router.push(`/admin/classes/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Class</h1>
      <ClassForm initialData={classItem} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
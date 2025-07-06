"use client";

import { useRouter, useParams } from "next/navigation";
import { BoardForm } from "@/components/entity/BoardForm";
import { useState } from "react";

const dummyBoard = {
  id: "1",
  name: "CBSE",
  short_code: "CBSE",
  country_id: "IN",
  description: "Central Board of Secondary Education",
};

export default function EditBoardPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [board] = useState(dummyBoard); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateBoard(params.id, data);
    setLoading(false);
    router.push(`/admin/boards/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Board</h1>
      <BoardForm initialData={board} onSubmit={handleSubmit} countries={[]}
      //  loading={loading}
      />
    </div>
  );
} 
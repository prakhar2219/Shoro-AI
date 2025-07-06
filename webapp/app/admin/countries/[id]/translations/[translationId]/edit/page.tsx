"use client";

import { useRouter, useParams } from "next/navigation";
import { CountryTranslationForm } from "@/components/entity/CountryTranslationForm";
import { useState } from "react";

const dummyTranslation = {
  id: "t1",
  language: "en",
  name: "India",
};

export default function EditCountryTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [translation] = useState(dummyTranslation); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateCountryTranslation(params.translationId, data);
    setLoading(false);
    router.push(`/admin/countries/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Country Translation</h1>
      <CountryTranslationForm initialData={translation} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
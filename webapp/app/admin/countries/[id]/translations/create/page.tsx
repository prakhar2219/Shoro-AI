"use client";

import { useRouter, useParams } from "next/navigation";
import { CountryTranslationForm } from "@/components/entity/CountryTranslationForm";
import { useState } from "react";

export default function CreateCountryTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await createCountryTranslation(params.id, data);
    setLoading(false);
    router.push(`/admin/countries/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Country Translation</h1>
      <CountryTranslationForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
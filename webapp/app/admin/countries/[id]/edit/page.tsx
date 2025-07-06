"use client";

import { useRouter, useParams } from "next/navigation";
import { CountryForm } from "@/components/entity/CountryForm";
import { useState } from "react";

const dummyCountry = {
  id: "1",
  name: "India",
  code: "IN",
  default_language_id: "en",
};

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [country] = useState(dummyCountry); // Replace with fetch logic

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // await updateCountry(params.id, data);
    setLoading(false);
    router.push(`/admin/countries/${params.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Country</h1>
      <CountryForm initialData={country} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
} 
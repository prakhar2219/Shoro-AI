"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { CountryCard } from "@/components/entity/CountryCard";
import Link from "next/link";

const dummyCountry = {
  id: "1",
  name: "India",
  code: "IN",
  default_language_id: "en",
  translations: [
    { id: "t1", language: "en", name: "India" },
    { id: "t2", language: "hi", name: "भारत" },
  ],
};

export default function CountryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [country] = useState(dummyCountry); // Replace with fetch logic

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Country Detail</h1>
        <Link href={`/admin/countries/${country.id}/edit`} className="btn btn-secondary">
          Edit Country
        </Link>
      </div>
      <CountryCard country={country} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {country.translations.map((t) => (
            <div key={t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{t.language}:</span> {t.name}
              </div>
              <Link
                href={`/admin/countries/${country.id}/translations/${t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/countries/${country.id}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
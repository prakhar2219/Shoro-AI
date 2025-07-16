"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CountryCard } from "@/components/entity/CountryCard";
import Link from "next/link";
import { getCountry, ICountry } from "@/lib/api/entities/countries";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { useToast } from "@/hooks/use-toast";

export default function CountryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [country, setCountry] = useState<ICountry | null>(null);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const countryId = Array.isArray(params.id) ? params.id[0] : params.id;
        const [countryRes, langs] = await Promise.all([
          getCountry(countryId),
          getLanguages(),
        ]);
        setCountry(countryRes);
        setLanguages(langs || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to fetch country.",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [params.id]);

  const languageMap = Object.fromEntries(languages.map(l => [l.code, l.name]));
  const translations = (country as any).translations || [];

  if (fetching) {
    return <div className="p-6 max-w-2xl mx-auto">Loading...</div>;
  }
  if (!country) {
    return <div className="p-6 max-w-2xl mx-auto text-red-500">Country not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Country Detail</h1>
        <Link href={`/admin/countries/${country.code}/edit`} className="btn btn-secondary">
          Edit Country
        </Link>
      </div>
      <CountryCard country={{
        code: country.code,
        name: country.name,
        default_language_code: country.default_language_code,
        supported_language_codes: country.supported_language_codes,
        translations: translations.map((t: any) => ({
          _id: t._id || t.id,
          language_code: t.language_code,
          name: t.name,
        })),
      }} languageMap={languageMap} />
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Translations</h2>
        <div className="flex flex-col gap-2">
          {translations.map((t: any) => (
            <div key={t._id || t.id} className="flex items-center gap-4 border p-2 rounded">
              <div className="flex-1">
                <span className="font-medium">{languageMap[t.language_code] || t.language_code}:</span> {t.name}
              </div>
              <Link
                href={`/admin/countries/${country.code}/translations/${t._id || t.id}/edit`}
                className="btn btn-xs btn-primary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
        <Link
          href={`/admin/countries/${country.code}/translations/create`}
          className="btn btn-sm btn-success mt-4"
        >
          Add Translation
        </Link>
      </div>
    </div>
  );
} 
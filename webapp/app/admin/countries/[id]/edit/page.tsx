"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CountryForm } from "@/components/entity/CountryForm";
import { getCountry, updateCountry, ICountry, IUpdateCountryRequest } from "@/lib/api/entities/countries";
import { getLanguages, ILanguage } from "@/lib/api/entities/language";
import { useToast } from "@/hooks/use-toast";

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (data: IUpdateCountryRequest) => {
    setLoading(true);
    try {
      const countryId = Array.isArray(params.id) ? params.id[0] : params.id;
      await updateCountry(countryId, data);
      toast({ title: "Success", description: "Country updated successfully." });
      router.push(`/admin/countries/${countryId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update country.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6 max-w-xl mx-auto">Loading...</div>;
  }
  if (!country) {
    return <div className="p-6 max-w-xl mx-auto text-red-500">Country not found.</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Country</h1>
      <CountryForm initialData={country} onSubmit={handleSubmit} loading={loading} languages={languages} />
    </div>
  );
} 
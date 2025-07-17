// components/entity/BoardForm.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BoardFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    name: string;
    short_code: string;
    country_id: string;
    default_language_id: string;
    supported_language_ids?: string[];
    description?: string;
    logo_url?: string;
  };
  countries: { id: string; name: string }[];
  languages: { id: string; name: string }[];
}

export function BoardForm({ onSubmit, loading = false, initialData, countries, languages }: BoardFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    short_code: initialData?.short_code || "",
    country_id: initialData?.country_id || (countries[0]?.id || ""),
    default_language_id: initialData?.default_language_id || (languages[0]?.id || ""),
    supported_language_ids: initialData?.supported_language_ids || [],
    description: initialData?.description || "",
    logo_url: initialData?.logo_url || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSupportedLanguagesChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.supported_language_ids.includes(value);
      return {
        ...prev,
        supported_language_ids: exists
          ? prev.supported_language_ids.filter((c) => c !== value)
          : [...prev.supported_language_ids, value],
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Board" : "Create Board"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter board name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_code">Short Code</Label>
            <Input
              id="short_code"
              value={formData.short_code}
              onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
              placeholder="e.g., CBSE, ICSE"
              maxLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_id">Country</Label>
            <Select
              value={formData.country_id}
              onValueChange={(value) => setFormData({ ...formData, country_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_language_id">Default Language</Label>
            <Select
              value={formData.default_language_id}
              onValueChange={(value) => setFormData({ ...formData, default_language_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supported Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  className={`px-2 py-1 rounded border text-xs ${formData.supported_language_ids.includes(lang.id) ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}
                  onClick={() => handleSupportedLanguagesChange(lang.id)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter board description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="Paste logo image URL"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Board" : "Create Board"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

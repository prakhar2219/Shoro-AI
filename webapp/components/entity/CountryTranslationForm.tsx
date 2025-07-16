"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryTranslationFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    language_code: string;
    name: string;
  };
  languages: { code: string; name: string }[];
}

export function CountryTranslationForm({ onSubmit, loading = false, initialData, languages }: CountryTranslationFormProps) {
  const [formData, setFormData] = useState({
    language_code: initialData?.language_code || (languages[0]?.code || ""),
    name: initialData?.name || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Translation" : "Add Translation"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language_code">Language</Label>
            <Select
              value={formData.language_code}
              onValueChange={(value) => setFormData({ ...formData, language_code: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter country name in selected language"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Translation" : "Add Translation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
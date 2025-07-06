// components/entity/CountryForm.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    name: string;
    code: string;
    default_language_id: string;
  };
}

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

export function CountryForm({ onSubmit, loading = false, initialData }: CountryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    default_language_id: initialData?.default_language_id || "en",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Country" : "Create Country"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter country name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., IN, US, UK"
              maxLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_language">Default Language</Label>
            <Select
              value={formData.default_language_id}
              onValueChange={(value) => setFormData({ ...formData, default_language_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default language" />
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Country" : "Create Country"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

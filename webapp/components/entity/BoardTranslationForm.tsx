"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";

interface BoardTranslationFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    language_id: string;
    name: string;
    description?: string;
    content?: any;
  };
  languages: { id: string; name: string }[];
}

export function BoardTranslationForm({ onSubmit, loading = false, initialData, languages }: BoardTranslationFormProps) {
  const [formData, setFormData] = useState({
    language_id: initialData?.language_id || (languages[0]?.id || ""),
    name: initialData?.name || "",
    description: initialData?.description || "",
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  const handleContentChange = (json: any) => {
    setFormData({ ...formData, content: json });
  };

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
            <Label htmlFor="language_id">Language</Label>
            <Select
              value={formData.language_id}
              onValueChange={(value) => setFormData({ ...formData, language_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
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
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter board name in selected language"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description in selected language"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={formData.content} onChange={handleContentChange} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Translation" : "Add Translation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
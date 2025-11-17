"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { RichTextEditor } from "@/components/rich-text-editor";
import { getLanguages } from "@/lib/api/entities/language";
import { getCountries } from "@/lib/api/entities/countries";
import { formatSlug } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GBCategoryFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  // optional: pass countries & languages as props if parent already fetched them
  countriesProp?: { id: string; name: string }[];
  languagesProp?: { id: string; name: string }[];
}

export function GBCategoryForm({
  initialData = {},
  onSubmit,
  loading = false,
  countriesProp,
  languagesProp,
}: GBCategoryFormProps) {
  const [languages, setLanguages] = useState<any[]>(
    Array.isArray(languagesProp) ? languagesProp : []
  );
  const [countries, setCountries] = useState<any[]>(
    Array.isArray(countriesProp) ? countriesProp : []
  );

  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(
    initialData?.supported_language_ids || []
  );

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    content: "",
    language_id: "",
    country_id: "", // <-- optional country
    order: 0,
    image: "",
    tag: "",
    source: "",
    author: "",
    is_published: false,
  });

  // load languages & countries if not provided by props
  useEffect(() => {
    if (!languagesProp) {
      getLanguages()
        .then((res: any) => {
          const arr = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : [];
          setLanguages(arr);
        })
        .catch(() => setLanguages([]));
    }

    if (!countriesProp) {
      getCountries()
        .then((res: any) => {
          const arr = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : [];
          // normalize to { id, name } if needed
          const normalized = arr.map((c: any) =>
            c.id || c._id ? { id: c.id || c._id, name: c.name || c.title || c.country || "" } : c
          );
          setCountries(normalized);
        })
        .catch(() => setCountries([]));
    }
  }, [languagesProp, countriesProp]);

  // load initial data into the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        content: initialData.content || "",
        language_id:
          typeof initialData.language_id === "object"
            ? initialData.language_id?._id || ""
            : initialData.language_id || "",
        country_id:
          typeof initialData.country_id === "object"
            ? initialData.country_id?._id || ""
            : initialData.country_id || "",
        order: initialData.order || 0,
        image: initialData.image || "",
        tag: Array.isArray(initialData.tag) ? initialData.tag.join(", ") : (initialData.tag || ""),
        source: initialData.source || "",
        author: initialData.author || "",
        is_published: !!initialData.is_published,
      });

      setSupportedLanguageIds(initialData.supported_language_ids || []);
    }
  }, [initialData?._id]); // depend on resource id to re-run only on change

  const handleSupportedLanguagesChange = (value: string) => {
    setSupportedLanguageIds((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!formData.slug?.trim()) {
      alert("Please enter a slug");
      return;
    }
    if (!formData.language_id) {
      alert("Please select a language");
      return;
    }
    if (formData.order < 0) {
      alert("Order must be >= 0");
      return;
    }

    const payload = {
      ...formData,
      // tags -> array
      tag: formData.tag ? formData.tag.split(",").map((t) => t.trim()).filter(Boolean) : [],
      order: Number(formData.order || 0),
      supported_language_ids: supportedLanguageIds,
      // country_id may be '' -> backend will interpret as null/absent
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: formatSlug(e.target.value) })}
            placeholder="e.g., technology or प्रौद्योगिकी"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="language_id">Language *</Label>
        <LanguageSelector
          value={formData.language_id}
          onValueChange={(v) => setFormData({ ...formData, language_id: v })}
          placeholder="Select Language"
          required
        />
      </div>

      <div>
        <Label htmlFor="country_id">Country (Optional)</Label>
        <Select
          value={formData.country_id}
          onValueChange={(v) => setFormData({ ...formData, country_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>

          <SelectContent className="max-h-64 overflow-y-auto">
            {/* countries normalized to { id, name } */}
            {countries.map((c: any) => (
              <SelectItem key={c.id || c._id} value={c.id || c._id}>
                {c.name}
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
              key={lang._id || lang.id}
              className={`px-2 py-1 rounded border text-xs ${
                supportedLanguageIds.includes(lang._id || lang.id)
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800"
              }`}
              onClick={() => handleSupportedLanguagesChange(lang._id || lang.id)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="tag">Tags (comma separated)</Label>
        <Input
          id="tag"
          value={formData.tag}
          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(html) => setFormData({ ...formData, content: html })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_published"
          checked={!!formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: !!checked })}
        />
        <Label htmlFor="is_published">Published</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/rich-text-editor";

interface TopicFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    chapter_id?: string;
    title?: string;
    slug?: string;
    order?: number;
    is_published?: boolean;
    content?: string;
  };
  chapters: { id: string; title: string }[];
}

export function TopicForm({ onSubmit, loading = false, initialData, chapters }: TopicFormProps) {
  const [formData, setFormData] = useState({
    chapter_id: initialData?.chapter_id || (chapters[0]?.id || ""),
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    order: initialData?.order ?? 0,
    is_published: initialData?.is_published ?? true,
    content: typeof initialData?.content === 'string' ? initialData.content : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, order: Number(formData.order) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Topic" : "Create Topic"}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapter_id">Chapter</Label>
            <select
              id="chapter_id"
              className="w-full border rounded px-3 py-2 bg-background"
              value={formData.chapter_id}
              onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter topic title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., introduction"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_published">Published</Label>
              <select
                id="is_published"
                className="w-full border rounded px-3 py-2 bg-background"
                value={String(formData.is_published)}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={formData.content} onChange={(html) => setFormData({ ...formData, content: html })} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Topic" : "Create Topic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/rich-text-editor";

interface SubtopicFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    topic_id?: string;
    title?: string;
    slug?: string;
    order?: number;
    is_published?: boolean;
    content?: string;
  };
  topics: { id: string; title: string }[];
}

export function SubtopicForm({ onSubmit, loading = false, initialData, topics }: SubtopicFormProps) {
  const [formData, setFormData] = useState({
    topic_id: initialData?.topic_id || (topics[0]?.id || ""),
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
        <CardTitle>{initialData ? "Edit Subtopic" : "Create Subtopic"}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic_id">Topic</Label>
            <select
              id="topic_id"
              className="w-full border rounded px-3 py-2 bg-background"
              value={formData.topic_id}
              onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter subtopic title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., basics"
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
            {loading ? "Saving..." : initialData ? "Update Subtopic" : "Create Subtopic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



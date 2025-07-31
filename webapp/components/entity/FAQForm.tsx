"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

interface FAQFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    entity_type?: string;
    entity_id?: string;
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
    content?: any;
  };
  entityType?: string;
  entityId?: string;
}

export function FAQForm({ onSubmit, loading = false, initialData, entityType, entityId }: FAQFormProps) {
  const [form, setForm] = useState({
    entity_type: entityType || initialData?.entity_type || "",
    entity_id: entityId || initialData?.entity_id || "",
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    category: initialData?.category || "",
    order: initialData?.order || 0,
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  const handleContentChange = (json: any) => {
    setForm({ ...form, content: json });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit FAQ" : "Create FAQ"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!entityType && (
            <div className="space-y-2">
              <Label htmlFor="entity_type">Entity Type</Label>
              <Select
                value={form.entity_type}
                onValueChange={(value) => setForm({ ...form, entity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chapter">Chapter</SelectItem>
                  <SelectItem value="Country">Country</SelectItem>
                  <SelectItem value="Board">Board</SelectItem>
                  <SelectItem value="Class">Class</SelectItem>
                  <SelectItem value="Subject">Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!entityId && (
            <div className="space-y-2">
              <Label htmlFor="entity_id">Entity ID</Label>
              <Input
                id="entity_id"
                value={form.entity_id}
                onChange={(e) => setForm({ ...form, entity_id: e.target.value })}
                placeholder="Enter entity ID"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter the FAQ question"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Enter the FAQ answer"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Enter category (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="Enter display order"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update FAQ" : "Create FAQ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DescriptiveQuestionFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    entity_type?: string;
    entity_id?: string;
    question?: string;
    answer?: string;
    difficulty?: string;
    tags?: string[];
    content?: any;
    author?: string;
    source?: string;
  };
  entityType?: string;
  entityId?: string;
}

export function DescriptiveQuestionForm({ onSubmit, loading = false, initialData, entityType, entityId }: DescriptiveQuestionFormProps) {
  const [form, setForm] = useState({
    entity_type: entityType || initialData?.entity_type || "",
    entity_id: entityId || initialData?.entity_id || "",
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    difficulty: initialData?.difficulty || "medium",
    tags: initialData?.tags || [],
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    author: initialData?.author || "",
    source: initialData?.source || "",
  });

  const [newTag, setNewTag] = useState("");

  const handleContentChange = (html: string) => {
    setForm({ ...form, content: html });
  };

  const handleAnswerChange = (html: string) => {
    setForm({ ...form, answer: html });
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Descriptive Question" : "Create Descriptive Question"}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
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
              placeholder="Enter the descriptive question"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <RichTextEditor value={form.answer} onChange={handleAnswerChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(value) => setForm({ ...form, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Enter author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Enter source"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Question" : "Create Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
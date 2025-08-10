"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MCQFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    entity_type?: string;
    entity_id?: string;
    question?: string;
    options?: Array<{ key: string; text: string }>;
    correct_answer?: string;
    explanation?: string;
    difficulty?: string;
    tags?: string[];
    content?: any;
  };
  entityType?: string;
  entityId?: string;
}

export function MCQForm({ onSubmit, loading = false, initialData, entityType, entityId }: MCQFormProps) {
  const [form, setForm] = useState({
    entity_type: entityType || initialData?.entity_type || "",
    entity_id: entityId || initialData?.entity_id || "",
    question: initialData?.question || "",
    options: initialData?.options || [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" }
    ],
    correct_answer: initialData?.correct_answer || "A",
    explanation: initialData?.explanation || "",
    difficulty: initialData?.difficulty || "medium",
    tags: initialData?.tags || [],
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  const [newTag, setNewTag] = useState("");

  const handleContentChange = (json: any) => {
    setForm({ ...form, content: json });
  };

  const handleOptionChange = (index: number, field: 'key' | 'text', value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };

  const addOption = () => {
    const newKey = String.fromCharCode(65 + form.options.length); // A, B, C, D, E, etc.
    setForm({
      ...form,
      options: [...form.options, { key: newKey, text: "" }]
    });
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) return; // Minimum 2 options
    const newOptions = form.options.filter((_, i) => i !== index);
    setForm({ ...form, options: newOptions });
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
    
    // Validate options
    if (form.options.length < 2) {
      alert("At least 2 options are required");
      return;
    }

    if (form.options.some(opt => !opt.text.trim())) {
      alert("All options must have text");
      return;
    }

    if (!form.options.find(opt => opt.key === form.correct_answer)) {
      alert("Correct answer must be one of the option keys");
      return;
    }

    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit MCQ" : "Create MCQ"}</CardTitle>
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
            <Input
              id="question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter the question"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {form.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option.key}
                  onChange={(e) => handleOptionChange(index, 'key', e.target.value)}
                  className="w-16"
                  placeholder="Key"
                  required
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="flex-1"
                  placeholder={`Option ${option.key}`}
                  required
                />
                {form.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption}>
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correct_answer">Correct Answer</Label>
            <Select
              value={form.correct_answer}
              onValueChange={(value) => setForm({ ...form, correct_answer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {form.options.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.key}: {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Input
              id="explanation"
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer"
            />
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
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update MCQ" : "Create MCQ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";

interface MCQTranslationFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    language_id: string;
    question: string;
    options?: Array<{ key: string; text: string }>;
    correct_answer?: string;
    explanation?: string;
    content?: any;
  };
  languages: { _id?: string; name: string }[];
  originalMCQ?: {
    options: Array<{ key: string; text: string }>;
    correct_answer: string;
  };
}

export function MCQTranslationForm({ 
  onSubmit, 
  loading = false, 
  initialData, 
  languages, 
  originalMCQ 
}: MCQTranslationFormProps) {
  const [formData, setFormData] = useState({
    language_id: initialData?.language_id || (languages[0]?._id || ""),
    question: initialData?.question || "",
    options: initialData?.options || originalMCQ?.options || [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" }
    ],
    correct_answer: initialData?.correct_answer || originalMCQ?.correct_answer || "A",
    explanation: initialData?.explanation || "",
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  const handleContentChange = (json: any) => {
    setFormData({ ...formData, content: json });
  };

  const handleOptionChange = (index: number, field: 'key' | 'text', value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that options match original structure
    if (originalMCQ && originalMCQ.options.length !== formData.options.length) {
      alert("Translation must have same number of options as original");
      return;
    }

    if (originalMCQ) {
      const originalKeys = originalMCQ.options.map(opt => opt.key);
      const translationKeys = formData.options.map(opt => opt.key);
      
      if (!arraysEqual(originalKeys, translationKeys)) {
        alert("Translation options must have same keys in same order as original");
        return;
      }

      if (originalMCQ.correct_answer !== formData.correct_answer) {
        alert("Translation must have same correct answer key as original");
        return;
      }
    }

    // Validate options
    if (formData.options.some(opt => !opt.text.trim())) {
      alert("All options must have text");
      return;
    }

    onSubmit(formData);
  };

  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
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
                  <SelectItem key={lang._id || ''} value={lang._id || ''}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter translated question"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option.key}
                  onChange={(e) => handleOptionChange(index, 'key', e.target.value)}
                  className="w-16"
                  placeholder="Key"
                  required
                  disabled={!!originalMCQ} // Disable key editing if original MCQ exists
                />
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="flex-1"
                  placeholder={`Translated option ${option.key}`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correct_answer">Correct Answer</Label>
            <Select
              value={formData.correct_answer}
              onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
              disabled={!!originalMCQ} // Disable if original MCQ exists
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {formData.options.map((option) => (
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
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Enter translated explanation"
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
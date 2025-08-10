"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";

interface FAQTranslationFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    language_id: string;
    question: string;
    answer: string;
    content?: any;
  };
  languages: { _id?: string; name: string }[];
}

export function FAQTranslationForm({ 
  onSubmit, 
  loading = false, 
  initialData, 
  languages 
}: FAQTranslationFormProps) {
  const [formData, setFormData] = useState({
    language_id: initialData?.language_id || (languages[0]?._id || ""),
    question: initialData?.question || "",
    answer: initialData?.answer || "",
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
                  <SelectItem key={lang._id || ''} value={lang._id || ''}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter translated question"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter translated answer"
              rows={5}
              required
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
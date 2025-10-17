"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { getBoards } from "@/lib/api/entities/boards";
import { getClassesByBoard } from "@/lib/api/entities/classes";
import { getSubjects } from "@/lib/api/entities/subjects";
import { getChapters } from "@/lib/api/entities/chapters";

interface TopicFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    _id?: string;
    board_id?: string;
    class_id?: string;
    subject_id?: string;
    chapter_id?: string;
    language_id?: string;
    title?: string;
    slug?: string;
    order?: number;
    is_published?: boolean;
    content?: string;
  };
}

export function TopicForm({ onSubmit, loading = false, initialData }: TopicFormProps) {
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    board_id: initialData?.board_id || "",
    class_id: initialData?.class_id || "",
    subject_id: initialData?.subject_id || "",
    chapter_id: initialData?.chapter_id || "",
    language_id: initialData?.language_id || "",
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    order: initialData?.order ?? 0,
    is_published: initialData?.is_published ?? true,
    content: typeof initialData?.content === 'string' ? initialData.content : '',
  });

  // Check if we're editing existing topic (has _id) vs adding new topic (no _id)
  const isEditMode = Boolean(initialData && initialData._id);

  // Load boards on mount
  useEffect(() => {
    getBoards().then(setBoards);
  }, []);

  // Load classes when board changes
  useEffect(() => {
    if (formData.board_id) {
      getClassesByBoard(formData.board_id).then(setClasses);
    } else {
      setClasses([]);
    }
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, class_id: "", subject_id: "", chapter_id: "" }));
      setSubjects([]);
      setChapters([]);
    }
  }, [formData.board_id, isEditMode]);

  // Load subjects when class changes
  useEffect(() => {
    if (formData.class_id) {
      getSubjects().then((allSubjects) => {
        setSubjects(allSubjects.filter((s: any) => {
          const sClassId = typeof s.class_id === 'object' ? s.class_id._id : s.class_id;
          return sClassId === formData.class_id;
        }));
      });
    } else {
      setSubjects([]);
    }
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, subject_id: "", chapter_id: "" }));
      setChapters([]);
    }
  }, [formData.class_id, isEditMode]);

  // Load chapters when subject changes
  useEffect(() => {
    if (formData.subject_id) {
      getChapters({ page: 1, limit: 1000, subject_id: formData.subject_id }).then((result) => {
        const allChapters = result.data || result || [];
        setChapters(allChapters);
      }).catch(error => {
        console.error('Error fetching chapters:', error);
        setChapters([]);
      });
    } else {
      setChapters([]);
    }
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, chapter_id: "" }));
    }
  }, [formData.subject_id, isEditMode]);

  // Auto-populate hierarchy in edit mode
  useEffect(() => {
    if (initialData && initialData.chapter_id && boards.length > 0) {
      // Find the chapter and populate the hierarchy
      getChapters({ page: 1, limit: 100 }).then((result) => {
        const allChapters = result.data || result || [];
        const chapter = allChapters.find((c: any) => c._id === initialData.chapter_id);
        if (chapter) {
          const subjectId = typeof chapter.subject_id === 'object' ? chapter.subject_id._id : chapter.subject_id;
          const classId = typeof chapter.subject_id === 'object' && chapter.subject_id.class_id 
            ? (typeof chapter.subject_id.class_id === 'object' ? chapter.subject_id.class_id._id : chapter.subject_id.class_id)
            : null;
          const boardId = typeof chapter.subject_id === 'object' && chapter.subject_id.class_id && chapter.subject_id.class_id.board_id
            ? (typeof chapter.subject_id.class_id.board_id === 'object' ? chapter.subject_id.class_id.board_id._id : chapter.subject_id.class_id.board_id)
            : null;
          
          setFormData(prev => ({
            ...prev,
            board_id: boardId || prev.board_id,
            class_id: classId || prev.class_id,
            subject_id: subjectId || prev.subject_id,
          }));
        }
      });
    }
  }, [initialData, boards]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.board_id) {
      alert('Please select a Board');
      return;
    }
    if (!formData.class_id) {
      alert('Please select a Class');
      return;
    }
    if (!formData.subject_id) {
      alert('Please select a Subject');
      return;
    }
    if (!formData.chapter_id) {
      alert('Please select a Chapter');
      return;
    }
    if (!formData.language_id) {
      alert('Please select a Language');
      return;
    }
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    if (!formData.order) {
      alert('Please enter an order number');
      return;
    }
    
    // Only send chapter_id and language_id to the API, but maintain hierarchy for UX
    onSubmit({ 
      chapter_id: formData.chapter_id,
      language_id: formData.language_id,
      title: formData.title,
      slug: formData.slug,
      order: Number(formData.order),
      is_published: formData.is_published,
      content: formData.content
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Topic" : "Create Topic"}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board_id">Board</Label>
            {isEditMode ? (
              <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                {boards.find((b) => b._id === formData.board_id)?.name || '-'}
              </div>
            ) : (
              <Select value={formData.board_id} onValueChange={(value) => setFormData(prev => ({ ...prev, board_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((b) => (
                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class_id">Class</Label>
            {isEditMode ? (
              <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                {classes.find((c) => c._id === formData.class_id)?.name || '-'}
              </div>
            ) : (
              <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))} disabled={!formData.board_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject_id">Subject</Label>
            {isEditMode ? (
              <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                {subjects.find((s) => s._id === formData.subject_id)?.name || '-'}
              </div>
            ) : (
              <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))} disabled={!formData.class_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter_id">Chapter</Label>
            <Select value={formData.chapter_id} onValueChange={(value) => setFormData(prev => ({ ...prev, chapter_id: value }))} disabled={!formData.subject_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select Chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language_id">Language</Label>
            <LanguageSelector
              value={formData.language_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language_id: value }))}
              placeholder="Select Language"
              required
            />
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



"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { getChapters } from "@/lib/api/entities/chapters";
import { getCountries } from "@/lib/api/entities/countries";
import { getBoards } from "@/lib/api/entities/boards";
import { getClasses } from "@/lib/api/entities/classes";
import { getSubjects } from "@/lib/api/entities/subjects";
import { getGBCategories } from "@/lib/api/entities/gbCategories";
import { getGBTopics } from "@/lib/api/entities/gbTopics";
import { getGBSubtopics } from "@/lib/api/entities/gbSubtopics";

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
    content: typeof initialData?.content === 'string' ? initialData.content : '',
  });

  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [gbCategories, setGbCategories] = useState<any[]>([]);
  const [gbTopics, setGbTopics] = useState<any[]>([]);
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState<string>("");
  const [selectedGbTopicId, setSelectedGbTopicId] = useState<string>("");

  useEffect(() => {
    const prefetch = async () => {
      try {
        const [b, c, s, gbc, gbt] = await Promise.all([
          getBoards().catch(() => []),
          getClasses().catch(() => []),
          getSubjects().catch(() => []),
          getGBCategories({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
          getGBTopics({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        ] as any);
        setBoards(Array.isArray(b) ? b : []);
        setClasses(Array.isArray(c) ? c : (c?.data || []));
        setSubjects(Array.isArray(s) ? s : (s?.data || []));
        setGbCategories((gbc as any).data || []);
        setGbTopics((gbt as any).data || []);
      } catch {}
    };
    prefetch();
  }, []);

  useEffect(() => {
    const load = async () => {
      const type = form.entity_type || entityType;
      if (!type) { setEntityOptions([]); return; }
      try {
        if (type === 'Chapter') {
          const res: any = await getChapters({ page: 1, limit: 100 });
          const list: any[] = Array.isArray(res) ? res : res?.data || [];
          setEntityOptions(list.map((c: any) => ({ id: c._id, label: c.title })));
        } else if (type === 'Country') {
          const list: any[] = await getCountries();
          setEntityOptions(list.map((x: any) => ({ id: x._id || x.id, label: x.name })));
        } else if (type === 'Board') {
          const list: any[] = await getBoards();
          setEntityOptions(list.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'Class') {
          const res: any = await getClasses();
          const list: any[] = Array.isArray(res) ? res : res?.data || [];
          setEntityOptions(list.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'Subject') {
          const res: any = await getSubjects();
          const list: any[] = Array.isArray(res) ? res : res?.data || [];
          setEntityOptions(list.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Category') {
          const res = await getGBCategories({ page: 1, limit: 100 });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Topic') {
          const res = await getGBTopics({ page: 1, limit: 100 });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Subtopic') {
          const res = await getGBSubtopics({ page: 1, limit: 100 });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else {
          setEntityOptions([]);
        }
      } catch (e) {
        setEntityOptions([]);
      }
    };
    load();
  }, [form.entity_type, entityType, selectedBoardId, selectedClassId, selectedSubjectId, selectedGbCategoryId, selectedGbTopicId]);

  const handleContentChange = (html: string) => {
    setForm({ ...form, content: html });
  };

  const handleAnswerChange = (html: string) => {
    setForm({ ...form, answer: html });
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
                  <SelectItem value="GB Category">GB Category</SelectItem>
                  <SelectItem value="GB Topic">GB Topic</SelectItem>
                  <SelectItem value="GB Subtopic">GB Subtopic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!entityId && (
            <div className="space-y-2">
              <Label htmlFor="entity_id">Entity</Label>
              {form.entity_type === 'Chapter' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select value={selectedBoardId} onValueChange={(v) => { setSelectedBoardId(v); setSelectedClassId(""); setSelectedSubjectId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (<SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.filter((cl: any) => !selectedBoardId || (cl.board_id?._id || cl.board_id) === selectedBoardId).map((cl: any) => (
                        <SelectItem key={cl._id} value={cl._id}>{cl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter((s: any) => !selectedClassId || (s.class_id?._id || s.class_id) === selectedClassId).map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {(form.entity_type === 'GB Topic' || form.entity_type === 'GB Subtopic') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select value={selectedGbCategoryId} onValueChange={(v) => { setSelectedGbCategoryId(v); setSelectedGbTopicId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select GB Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {gbCategories.map((c) => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {form.entity_type === 'GB Subtopic' && (
                    <Select value={selectedGbTopicId} onValueChange={(v) => { setSelectedGbTopicId(v); setForm({ ...form, entity_id: "" }); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GB Topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {gbTopics.filter((t: any) => !selectedGbCategoryId || (t.gb_category_id?._id || t.gb_category_id) === selectedGbCategoryId).map((t: any) => (
                          <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              <Select
                value={form.entity_id}
                onValueChange={(value) => setForm({ ...form, entity_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.entity_type ? `Select ${form.entity_type}` : 'Select entity'} />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <RichTextEditor value={form.answer} onChange={handleAnswerChange} />
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
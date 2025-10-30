"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getChapters } from "@/lib/api/entities/chapters";
import { getCountries } from "@/lib/api/entities/countries";
import { getBoards } from "@/lib/api/entities/boards";
import { getClasses } from "@/lib/api/entities/classes";
import { getSubjects } from "@/lib/api/entities/subjects";
import { getGBCategories } from "@/lib/api/entities/gbCategories";
import { getGBTopics } from "@/lib/api/entities/gbTopics";
import { getGBSubtopics } from "@/lib/api/entities/gbSubtopics";
import { getTopics } from "@/lib/api/entities/topics";
import { getSubtopics } from "@/lib/api/entities/subtopics";

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
  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; label: string }>>([]);
  // Core filters
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  // GB filters
  const [gbCategories, setGbCategories] = useState<any[]>([]);
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState<string>("");
  const [gbTopics, setGbTopics] = useState<any[]>([]);
  const [selectedGbTopicId, setSelectedGbTopicId] = useState<string>("");

  useEffect(() => {
    const prefetch = async () => {
      try {
        const [b, c, s, ch, gbc, gbt] = await Promise.all([
          getBoards().catch(() => []),
          getClasses().catch(() => []),
          getSubjects().catch(() => []),
          getChapters({ page: 1, limit: 100 } as any).catch(() => ({ data: [] })),
          getGBCategories({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
          getGBTopics({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        ] as any);
        setBoards(Array.isArray(b) ? b : []);
        setClasses(Array.isArray(c) ? c : (c?.data || []));
        setSubjects(Array.isArray(s) ? s : (s?.data || []));
        setChapters(Array.isArray(ch) ? ch : (ch?.data || []));
        setGbCategories((gbc as any).data || []);
        setGbTopics((gbt as any).data || []);
      } catch {}
    };
    prefetch();
  }, []);

  // Load entity options when type changes
  useEffect(() => {
    const load = async () => {
      const type = form.entity_type || entityType;
      if (!type) { setEntityOptions([]); return; }
      try {
        if (type === 'Chapter') {
          const res: any = await getChapters({ page: 1, limit: 100, board_id: selectedBoardId || undefined, class_id: selectedClassId || undefined, subject_id: selectedSubjectId || undefined } as any);
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
          const res = await getGBTopics({ page: 1, limit: 100, gb_category_id: selectedGbCategoryId || undefined });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Subtopic') {
          const res = await getGBSubtopics({ page: 1, limit: 100, gb_topic_id: selectedGbTopicId || undefined });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'Topic') {
          const filtered = selectedChapterId
            ? topics.filter((t: any) => (t.chapter_id?._id || t.chapter_id) === selectedChapterId)
            : topics;
          setEntityOptions(filtered.map((x: any) => ({ id: x._id, label: x.title })));
        } else if (type === 'Subtopic') {
          if (!selectedTopicId) setEntityOptions([]);
        } else {
          setEntityOptions([]);
        }
      } catch (e) {
        setEntityOptions([]);
      }
    };
    load();
  }, [form.entity_type, entityType, selectedBoardId, selectedClassId, selectedSubjectId, selectedGbCategoryId, selectedGbTopicId]);

  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedChapterId) { setTopics([]); return; }
      try {
        const list = await getTopics(selectedChapterId);
        setTopics(Array.isArray(list) ? list : (list as any)?.data || []);
      } catch { setTopics([]); }
    };
    loadTopics();
  }, [selectedChapterId]);

  useEffect(() => {
    const loadSubtopics = async () => {
      if (!selectedTopicId) return;
      try {
        const list = await getSubtopics(selectedTopicId);
        setEntityOptions((Array.isArray(list) ? list : (list as any)?.data || []).map((x: any) => ({ id: x._id, label: x.title || x.name })));
      } catch {}
    };
    if (form.entity_type === 'Subtopic') loadSubtopics();
  }, [selectedTopicId, form.entity_type]);

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
                  <SelectItem value="Topic">Topic</SelectItem>
                  <SelectItem value="Subtopic">Subtopic</SelectItem>
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
              {form.entity_type === 'Topic' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Select value={selectedBoardId} onValueChange={(v) => { setSelectedBoardId(v); setSelectedClassId(""); setSelectedSubjectId(""); setSelectedChapterId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (<SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.filter((cl: any) => !selectedBoardId || (cl.board_id?._id || cl.board_id) === selectedBoardId).map((cl: any) => (
                        <SelectItem key={cl._id} value={cl._id}>{cl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter((s: any) => !selectedClassId || (s.class_id?._id || s.class_id) === selectedClassId).map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.filter((ch: any) => !selectedSubjectId || (ch.subject_id?._id || ch.subject_id) === selectedSubjectId).map((ch: any) => (
                        <SelectItem key={ch._id} value={ch._id}>{ch.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.entity_type === 'Subtopic' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Select value={selectedBoardId} onValueChange={(v) => { setSelectedBoardId(v); setSelectedClassId(""); setSelectedSubjectId(""); setSelectedChapterId(""); setSelectedTopicId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (<SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); setSelectedTopicId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.filter((cl: any) => !selectedBoardId || (cl.board_id?._id || cl.board_id) === selectedBoardId).map((cl: any) => (
                        <SelectItem key={cl._id} value={cl._id}>{cl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); setSelectedTopicId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter((s: any) => !selectedClassId || (s.class_id?._id || s.class_id) === selectedClassId).map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.filter((ch: any) => !selectedSubjectId || (ch.subject_id?._id || ch.subject_id) === selectedSubjectId).map((ch: any) => (
                        <SelectItem key={ch._id} value={ch._id}>{ch.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedTopicId} onValueChange={(v) => { setSelectedTopicId(v); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.filter((t: any) => !selectedChapterId || (t.chapter_id?._id || t.chapter_id) === selectedChapterId).map((t: any) => (
                        <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
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
    content: typeof initialData?.content === 'string' ? initialData.content : '',
  });

  const [newTag, setNewTag] = useState("");
  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; label: string }>>([]);
  // Core hierarchy filters
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  // GB hierarchy filters
  const [gbCategories, setGbCategories] = useState<any[]>([]);
  const [gbTopics, setGbTopics] = useState<any[]>([]);
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState<string>("");
  const [selectedGbTopicId, setSelectedGbTopicId] = useState<string>("");

  // Prefetch lightweight lists for filters
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

  // Refresh GB Topics when category changes for better filtering
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedGbCategoryId) return;
      try {
        const res = await getGBTopics({ page: 1, limit: 100, gb_category_id: selectedGbCategoryId });
        setGbTopics((res as any).data || []);
      } catch {}
    };
    loadTopics();
  }, [selectedGbCategoryId]);

  // Refresh Topics when chapter changes; Subtopics when topic changes
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
          // Filter classes by selected board if provided
          const list: any[] = classes;
          const filtered = selectedBoardId
            ? list.filter((cl: any) => (cl.board_id?._id || cl.board_id) === selectedBoardId)
            : list;
          setEntityOptions(filtered.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'Subject') {
          // Filter subjects by selected class
          const list: any[] = subjects;
          const filtered = selectedClassId
            ? list.filter((s: any) => (s.class_id?._id || s.class_id) === selectedClassId)
            : list;
          setEntityOptions(filtered.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'Topic') {
          // Filter topics by selected chapter
          const list: any[] = topics;
          const filtered = selectedChapterId
            ? list.filter((t: any) => (t.chapter_id?._id || t.chapter_id) === selectedChapterId)
            : list;
          setEntityOptions(filtered.map((x: any) => ({ id: x._id, label: x.title })));
        } else if (type === 'Subtopic') {
          // When Subtopic selected, entityOptions is managed by selectedTopicId effect
          // If no topic chosen yet, clear options
          if (!selectedTopicId) setEntityOptions([]);
        } else if (type === 'GB Category') {
          const res = await getGBCategories({ page: 1, limit: 100 });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Topic') {
          const res = await getGBTopics({ page: 1, limit: 100, gb_category_id: selectedGbCategoryId || undefined });
          setEntityOptions((res as any).data.map((x: any) => ({ id: x._id, label: x.name })));
        } else if (type === 'GB Subtopic') {
          const res = await getGBSubtopics({ page: 1, limit: 100, gb_topic_id: selectedGbTopicId || undefined });
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
              {/* Hierarchy filters for Chapter */}
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
              {/* Filters for Class (Board) and Subject (Board -> Class) */}
              {form.entity_type === 'Class' && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                  <Select value={selectedBoardId} onValueChange={(v) => { setSelectedBoardId(v); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (<SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
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
              {form.entity_type === 'Subject' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select value={selectedBoardId} onValueChange={(v) => { setSelectedBoardId(v); setSelectedClassId(""); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (<SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setForm({ ...form, entity_id: "" }); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.filter((cl: any) => !selectedBoardId || (cl.board_id?._id || cl.board_id) === selectedBoardId).map((cl: any) => (
                        <SelectItem key={cl._id} value={cl._id}>{cl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Hierarchy filters for GB Topic/Subtopic */}
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
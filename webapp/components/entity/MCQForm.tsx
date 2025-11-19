"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getLanguages } from "@/lib/api/entities/language";

/**
 * Full rewritten MCQForm.tsx
 * - Single source of truth for filters
 * - Controlled selects that always render a Select wrapper
 * - "No items found" placeholders
 * - Scrollable dropdowns and forced bottom placement
 * - Hover + selected styles (Style B)
 */

/* ---------- Helpers ---------- */

// Normalize API responses to arrays
function normalizeList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.items && Array.isArray(res.items)) return res.items;
  return [];
}

// Generic filtered list helper
function filterByHierarchy<T extends any>(
  list: T[],
  {
    boardId,
    classId,
    subjectId,
    chapterId,
  }: { boardId?: string; classId?: string; subjectId?: string; chapterId?: string }
) {
  return list.filter((item: any) => {
    if (boardId) {
      const b = item.board_id?._id || item.board_id;
      if (b && b !== boardId) return false;
    }
    if (classId) {
      const c = item.class_id?._id || item.class_id;
      if (c && c !== classId) return false;
    }
    if (subjectId) {
      const s = item.subject_id?._id || item.subject_id;
      if (s && s !== subjectId) return false;
    }
    if (chapterId) {
      const ch = item.chapter_id?._id || item.chapter_id;
      if (ch && ch !== chapterId) return false;
    }
    return true;
  });
}

/* ---------- Types ---------- */

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
    supported_language_ids?: string[];
  };
  entityType?: string;
  entityId?: string;
}

/* ---------- Component ---------- */

export function MCQForm({
  onSubmit,
  loading = false,
  initialData,
  entityType,
  entityId,
}: MCQFormProps) {
  // Form state
  const [form, setForm] = useState({
    entity_type: entityType || initialData?.entity_type || "",
    entity_id: entityId || initialData?.entity_id || "",
    question: initialData?.question || "",
    options:
      initialData?.options || [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ],
    correct_answer: initialData?.correct_answer || "A",
    explanation: initialData?.explanation || "",
    difficulty: initialData?.difficulty || "medium",
    tags: initialData?.tags || [],
    content: typeof initialData?.content === "string" ? initialData.content : "",
  });

  const [newTag, setNewTag] = useState("");

  // Collections
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [gbCategories, setGbCategories] = useState<any[]>([]);
  const [gbTopics, setGbTopics] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  // Selected hierarchical nodes
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState<string>("");
  const [selectedGbTopicId, setSelectedGbTopicId] = useState<string>("");

  // Supported languages
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(
    initialData?.supported_language_ids || []
  );

  // Options for the final entity dropdown (entity_id)
  const [entityOptions, setEntityOptions] = useState<Array<{ id: string; label: string }>>(
    []
  );

  // Prefetch lists on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [b, c, s, ch, gbc, gbt, langs] = await Promise.all([
          getBoards().catch(() => []),
          getClasses().catch(() => []),
          getSubjects().catch(() => []),
          getChapters({ page: 1, limit: 500 }).catch(() => ({ data: [] })),
          getGBCategories({ page: 1, limit: 500 }).catch(() => ({ data: [] })),
          getGBTopics({ page: 1, limit: 500 }).catch(() => ({ data: [] })),
          getLanguages().catch(() => []),
        ]);

        setBoards(normalizeList(b));
        setClasses(normalizeList(c));
        setSubjects(normalizeList(s));
        setChapters(normalizeList(ch));
        setGbCategories(normalizeList(gbc));
        setGbTopics(normalizeList(gbt));
        setLanguages(normalizeList(langs));
      } catch (err) {
        // swallow - already handled in .catch
      }
    };

    load();
  }, []);

  // Load topics whenever chapter changes (for topic/subtopic flows)
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedChapterId) {
        setTopics([]);
        return;
      }
      try {
        const list = await getTopics(selectedChapterId).catch(() => []);
        setTopics(normalizeList(list));
      } catch {}
    };
    loadTopics();
  }, [selectedChapterId]);

  // Load subtopics when topic changes (for subtopic flow)
  useEffect(() => {
    const loadSubtopics = async () => {
      if (!selectedTopicId) return;
      try {
        const list = await getSubtopics(selectedTopicId).catch(() => []);
        setEntityOptions(
          normalizeList(list).map((x: any) => ({ id: x._id, label: x.title || x.name }))
        );
      } catch {
        setEntityOptions([]);
      }
    };
    loadSubtopics();
  }, [selectedTopicId]);

  // Build entityOptions depending on entity_type and filters
  useEffect(() => {
    const load = async () => {
      const type = form.entity_type || entityType;
      if (!type) {
        setEntityOptions([]);
        return;
      }

      try {
        if (type === "Chapter") {
          const res = await getChapters({
            page: 1,
            limit: 500,
            board_id: selectedBoardId || undefined,
            class_id: selectedClassId || undefined,
            subject_id: selectedSubjectId || undefined,
          }).catch(() => ({ data: [] }));
          const list = normalizeList(res);
          setEntityOptions(list.map((c: any) => ({ id: c._id, label: c.title })));
          return;
        }

        if (type === "Country") {
          const list = await getCountries().catch(() => []);
          setEntityOptions(normalizeList(list).map((x: any) => ({ id: x._id || x.id, label: x.name })));
          return;
        }

        if (type === "Board") {
          setEntityOptions(boards.map((b) => ({ id: b._id, label: b.name })));
          return;
        }

        if (type === "Class") {
          const filtered = selectedBoardId
            ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId)
            : classes;
          setEntityOptions(filtered.map((c) => ({ id: c._id, label: c.name })));
          return;
        }

        if (type === "Subject") {
          const filtered = selectedClassId
            ? subjects.filter((s) => (s.class_id?._id || s.class_id) === selectedClassId)
            : subjects;
          setEntityOptions(filtered.map((s) => ({ id: s._id, label: s.name })));
          return;
        }

        if (type === "Topic") {
          const list = selectedChapterId
            ? topics.filter((t) => (t.chapter_id?._id || t.chapter_id) === selectedChapterId)
            : topics;
          setEntityOptions(list.map((t) => ({ id: t._id, label: t.title })));
          return;
        }

        if (type === "GB Category") {
          setEntityOptions(gbCategories.map((g) => ({ id: g._id, label: g.name })));
          return;
        }

        if (type === "GB Topic") {
          const list = selectedGbCategoryId
            ? gbTopics.filter((t) => (t.gb_category_id?._id || t.gb_category_id) === selectedGbCategoryId)
            : gbTopics;
          setEntityOptions(list.map((t) => ({ id: t._id, label: t.name })));
          return;
        }

        if (type === "GB Subtopic") {
          const res = await getGBSubtopics({
            page: 1,
            limit: 500,
            gb_topic_id: selectedGbTopicId || undefined,
          }).catch(() => ({ data: [] }));
          setEntityOptions(normalizeList(res).map((x: any) => ({ id: x._id, label: x.name })));
          return;
        }

        // default
        setEntityOptions([]);
      } catch (err) {
        setEntityOptions([]);
      }
    };

    load();
  }, [
    form.entity_type,
    entityType,
    selectedBoardId,
    selectedClassId,
    selectedSubjectId,
    selectedChapterId,
    selectedGbCategoryId,
    selectedGbTopicId,
    boards,
    classes,
    subjects,
    topics,
    gbCategories,
    gbTopics,
  ]);

  /* ---------- Form helpers ---------- */

  const handleContentChange = (html: string) => setForm({ ...form, content: html });

  const handleOptionChange = (i: number, field: "key" | "text", value: string) => {
    const opts = [...form.options];
    opts[i][field] = value;
    setForm({ ...form, options: opts });
  };

  const addOption = () => {
    const newKey = String.fromCharCode(65 + form.options.length);
    setForm({ ...form, options: [...form.options, { key: newKey, text: "" }] });
  };

  const removeOption = (i: number) => {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (t: string) => setForm({ ...form, tags: form.tags.filter((tag) => tag !== t) });

  const toggleLanguage = (id: string) =>
    setSupportedLanguageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.options.length < 2) {
      alert("At least 2 options required");
      return;
    }

    if (form.options.some((o) => !o.text.trim())) {
      alert("All options must have text");
      return;
    }

    if (!form.options.find((o) => o.key === form.correct_answer)) {
      alert("Correct answer must match an option key");
      return;
    }

    onSubmit({ ...form, supported_language_ids: supportedLanguageIds });
  };

  /* ---------- UI helpers for selects ---------- */

  // Single function to render a SelectContent with no-items placeholder and style B highlighting
  const renderSelectContent = (items: Array<{ id: string; label: string }>, noItemsText = "No items found") => {
    if (!items || items.length === 0) {
      return (
        <SelectContent side="bottom" align="start" className="max-h-64 overflow-y-auto">
          <div className="px-3 py-2 text-sm text-gray-500">{noItemsText}</div>
        </SelectContent>
      );
    }

    return (
      <SelectContent side="bottom" align="start" className="max-h-64 overflow-y-auto">
        {items.map((it) => (
          <SelectItem
            key={it.id}
            value={it.id}
            className="data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 hover:bg-gray-100"
          >
            {it.label}
          </SelectItem>
        ))}
      </SelectContent>
    );
  };

  // Helpers to compute filtered arrays for the UI (memoized for perf)
  const filteredChaptersForTopic = useMemo(
    () =>
      filterByHierarchy(chapters, {
        boardId: selectedBoardId || undefined,
        classId: selectedClassId || undefined,
        subjectId: selectedSubjectId || undefined,
      }),
    [chapters, selectedBoardId, selectedClassId, selectedSubjectId]
  );

  const filteredChaptersForSubtopic = useMemo(
    () =>
      filterByHierarchy(chapters, {
        boardId: selectedBoardId || undefined,
        classId: selectedClassId || undefined,
        subjectId: selectedSubjectId || undefined,
      }),
    [chapters, selectedBoardId, selectedClassId, selectedSubjectId]
  );

  const filteredTopicsForSubtopic = useMemo(
    () =>
      filterByHierarchy(topics, {
        chapterId: selectedChapterId || undefined,
      }),
    [topics, selectedChapterId]
  );

  /* ---------- Render ---------- */

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit MCQ" : "Create MCQ"}</CardTitle>
      </CardHeader>

      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entity Type */}
          {!entityType && (
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select
                value={form.entity_type}
                onValueChange={(v) => setForm({ ...form, entity_type: v, entity_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" className="max-h-64 overflow-y-auto">
                  <SelectItem value="Chapter">Chapter</SelectItem>
                  <SelectItem value="Topic">Topic</SelectItem>
                  <SelectItem value="Subtopic">Subtopic</SelectItem>
                  <SelectItem value="Subject">Subject</SelectItem>
                  <SelectItem value="Class">Class</SelectItem>
                  <SelectItem value="Board">Board</SelectItem>
                  <SelectItem value="Country">Country</SelectItem>
                  <SelectItem value="GB Category">GB Category</SelectItem>
                  <SelectItem value="GB Topic">GB Topic</SelectItem>
                  <SelectItem value="GB Subtopic">GB Subtopic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hierarchical filters + entity selector */}
          {!entityId && (
            <div className="space-y-2">
              <Label>Entity</Label>

              {/* Chapter flow */}
              {form.entity_type === "Chapter" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Board */}
                  <Select
                    value={selectedBoardId}
                    onValueChange={(v) => {
                      setSelectedBoardId(v);
                      setSelectedClassId("");
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    {renderSelectContent(boards.map((b) => ({ id: b._id, label: b.name })), "No boards found")}
                  </Select>

                  {/* Class */}
                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => {
                      setSelectedClassId(v);
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedBoardId ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId) : classes).map((c) => ({ id: c._id, label: c.name })),
                      "No classes found"
                    )}
                  </Select>

                  {/* Subject */}
                  <Select
                    value={selectedSubjectId}
                    onValueChange={(v) => {
                      setSelectedSubjectId(v);
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedClassId ? subjects.filter((s) => (s.class_id?._id || s.class_id) === selectedClassId) : subjects).map((s) => ({ id: s._id, label: s.name })),
                      "No subjects found"
                    )}
                  </Select>
                </div>
              )}

              {/* Topic flow (Board -> Class -> Subject -> Chapter(for topic) ) */}
              {form.entity_type === "Topic" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {/* Board */}
                  <Select
                    value={selectedBoardId}
                    onValueChange={(v) => {
                      setSelectedBoardId(v);
                      setSelectedClassId("");
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    {renderSelectContent(boards.map((b) => ({ id: b._id, label: b.name })), "No boards found")}
                  </Select>

                  {/* Class */}
                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => {
                      setSelectedClassId(v);
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedBoardId ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId) : classes).map((c) => ({ id: c._id, label: c.name })),
                      "No classes found"
                    )}
                  </Select>

                  {/* Subject */}
                  <Select
                    value={selectedSubjectId}
                    onValueChange={(v) => {
                      setSelectedSubjectId(v);
                      setSelectedChapterId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedClassId ? subjects.filter((s) => (s.class_id?._id || s.class_id) === selectedClassId) : subjects).map((s) => ({ id: s._id, label: s.name })),
                      "No subjects found"
                    )}
                  </Select>

                  {/* Chapter */}
                  <Select
                    value={selectedChapterId}
                    onValueChange={(v) => {
                      setSelectedChapterId(v);
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    {renderSelectContent(
                      filteredChaptersForTopic.map((c) => ({ id: c._id, label: c.title })),
                      "No chapters found"
                    )}
                  </Select>
                </div>
              )}

              {/* Subtopic flow (Board -> Class -> Subject -> Chapter -> Topic -> Subtopic) */}
              {form.entity_type === "Subtopic" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {/* Board */}
                  <Select
                    value={selectedBoardId}
                    onValueChange={(v) => {
                      setSelectedBoardId(v);
                      setSelectedClassId("");
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setSelectedTopicId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    {renderSelectContent(boards.map((b) => ({ id: b._id, label: b.name })), "No boards found")}
                  </Select>

                  {/* Class */}
                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => {
                      setSelectedClassId(v);
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                      setSelectedTopicId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedBoardId ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId) : classes).map((c) => ({ id: c._id, label: c.name })),
                      "No classes found"
                    )}
                  </Select>

                  {/* Subject */}
                  <Select
                    value={selectedSubjectId}
                    onValueChange={(v) => {
                      setSelectedSubjectId(v);
                      setSelectedChapterId("");
                      setSelectedTopicId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedClassId ? subjects.filter((s) => (s.class_id?._id || s.class_id) === selectedClassId) : subjects).map((s) => ({ id: s._id, label: s.name })),
                      "No subjects found"
                    )}
                  </Select>

                  {/* Chapter */}
                  <Select
                    value={selectedChapterId}
                    onValueChange={(v) => {
                      setSelectedChapterId(v);
                      setSelectedTopicId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    {renderSelectContent(
                      filteredChaptersForSubtopic.map((c) => ({ id: c._id, label: c.title })),
                      "No chapters found"
                    )}
                  </Select>

                  {/* Topic */}
                  <Select
                    value={selectedTopicId}
                    onValueChange={(v) => {
                      setSelectedTopicId(v);
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    {renderSelectContent(
                      filteredTopicsForSubtopic.map((t) => ({ id: t._id, label: t.title })),
                      "No topics found"
                    )}
                  </Select>
                </div>
              )}

              {/* Subject flow (Board -> Class) */}
              {form.entity_type === "Subject" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select
                    value={selectedBoardId}
                    onValueChange={(v) => {
                      setSelectedBoardId(v);
                      setSelectedClassId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    {renderSelectContent(boards.map((b) => ({ id: b._id, label: b.name })), "No boards found")}
                  </Select>

                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => {
                      setSelectedClassId(v);
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    {renderSelectContent(
                      (selectedBoardId ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId) : classes).map((c) => ({ id: c._id, label: c.name })),
                      "No classes found"
                    )}
                  </Select>
                </div>
              )}

              {/* GB Category / Topic / Subtopic flows */}
              {(form.entity_type === "GB Topic" || form.entity_type === "GB Subtopic" || form.entity_type === "GB Category") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select
                    value={selectedGbCategoryId}
                    onValueChange={(v) => {
                      setSelectedGbCategoryId(v);
                      setSelectedGbTopicId("");
                      setForm({ ...form, entity_id: "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GB Category" />
                    </SelectTrigger>
                    {renderSelectContent(gbCategories.map((c) => ({ id: c._id, label: c.name })), "No GB categories found")}
                  </Select>

                  {form.entity_type === "GB Subtopic" ? (
                    <Select
                      value={selectedGbTopicId}
                      onValueChange={(v) => {
                        setSelectedGbTopicId(v);
                        setForm({ ...form, entity_id: "" });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select GB Topic" />
                      </SelectTrigger>
                      {renderSelectContent(
                        (selectedGbCategoryId ? gbTopics.filter((t) => (t.gb_category_id?._id || t.gb_category_id) === selectedGbCategoryId) : gbTopics).map((t) => ({ id: t._id, label: t.name })),
                        "No GB topics found"
                      )}
                    </Select>
                  ) : (
                    // show empty placeholder for GB Category or GB Topic flows if second column isn't needed
                    <div />
                  )}
                </div>
              )}

              {/* Final entity selector */}
              <Select
                value={form.entity_id}
                onValueChange={(value) => setForm({ ...form, entity_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.entity_type ? `Select ${form.entity_type}` : "Select entity"} />
                </SelectTrigger>

                {renderSelectContent(entityOptions.map((e) => ({ id: e.id, label: e.label })), `No ${form.entity_type?.toLowerCase() || "items"} found`)}
              </Select>
            </div>
          )}

          {/* Supported languages */}
          <div className="space-y-2">
            <Label>Supported Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang._id}
                  type="button"
                  variant={supportedLanguageIds.includes(lang._id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLanguage(lang._id)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter the question"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={opt.key}
                  onChange={(e) => handleOptionChange(i, "key", e.target.value)}
                  className="w-16"
                  placeholder="Key"
                />
                <Input
                  value={opt.text}
                  onChange={(e) => handleOptionChange(i, "text", e.target.value)}
                  className="flex-1"
                  placeholder={`Option ${opt.key}`}
                />
                {form.options.length > 2 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeOption(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption}>
              Add Option
            </Button>
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select value={form.correct_answer} onValueChange={(v) => setForm({ ...form, correct_answer: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" className="max-h-64 overflow-y-auto">
                {form.options.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key} className="data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 hover:bg-gray-100">
                    {opt.key}: {opt.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Input value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Explain why this answer is correct" />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" className="max-h-64 overflow-y-auto">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update MCQ" : "Create MCQ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default MCQForm;

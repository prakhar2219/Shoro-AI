// webapp/components/entity/ShortQuestionForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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

interface ShortQuestionFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    entity_type?: string;
    entity_id?: string;
    question?: string;
    answer?: string;
    explanation?: string;
    difficulty?: string;
    tags?: string[];
    content?: any;
    supported_language_ids?: string[];
    is_active?: boolean;
  };
  entityType?: string;
  entityId?: string;
}

/* ---------- Component ---------- */

export function ShortQuestionForm({
  onSubmit,
  loading = false,
  initialData,
  entityType,
  entityId,
}: ShortQuestionFormProps) {
  // Form state
  const [form, setForm] = useState({
    entity_type: entityType || initialData?.entity_type || "",
    entity_id: entityId || initialData?.entity_id || "",
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    explanation: initialData?.explanation || "",
    difficulty: initialData?.difficulty || "medium",
    tags: initialData?.tags || [],
    content:
      typeof initialData?.content === "string" ? initialData.content : "",
    is_active:
      typeof initialData?.is_active === "boolean"
        ? initialData.is_active
        : true,
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
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState<string>(
    ""
  );
  const [selectedGbTopicId, setSelectedGbTopicId] = useState<string>("");

  // Supported languages
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(
    initialData?.supported_language_ids || []
  );

  // Options for the final entity dropdown (entity_id)
  const [entityOptions, setEntityOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);

  // Prefetch lists on mount
  useEffect(() => {
    const load = async () => {
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
      const list = await getTopics(selectedChapterId).catch(() => []);
      setTopics(normalizeList(list));
    };

    loadTopics();
  }, [selectedChapterId]);

  // Load subtopics when topic changes (for subtopic flow)
  useEffect(() => {
    if (!selectedTopicId) return;
    const load = async () => {
      const res = await getSubtopics(selectedTopicId).catch(() => []);
      setEntityOptions(
        normalizeList(res).map((x: any) => ({ id: x._id, label: x.title || x.name }))
      );
    };
    load();
  }, [selectedTopicId]);

  // Build entityOptions depending on entity_type and filters
  useEffect(() => {
    const load = async () => {
      const type = form.entity_type || entityType;

      if (!type) {
        setEntityOptions([]);
        return;
      }

      // CHAPTER
      if (type === "Chapter") {
        const result = await getChapters({
          page: 1,
          limit: 500,
          board_id: selectedBoardId || undefined,
          class_id: selectedClassId || undefined,
          subject_id: selectedSubjectId || undefined,
        }).catch(() => ({ data: [] }));

        const list = normalizeList(result);
        return setEntityOptions(
          list.map((ch: any) => ({ id: ch._id, label: ch.title }))
        );
      }

      // COUNTRY
      if (type === "Country") {
        const list = await getCountries().catch(() => []);
        return setEntityOptions(
          normalizeList(list).map((x: any) => ({ id: x._id || x.id, label: x.name }))
        );
      }

      // BOARD
      if (type === "Board") {
        return setEntityOptions(boards.map((x) => ({ id: x._id, label: x.name })));
      }

      // CLASS
      if (type === "Class") {
        const list = selectedBoardId
          ? classes.filter((cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId)
          : classes;
        return setEntityOptions(list.map((x) => ({ id: x._id, label: x.name })));
      }

      // SUBJECT
      if (type === "Subject") {
        const list = selectedClassId
          ? subjects.filter((s) => (s.class_id?._id || s.class_id) === selectedClassId)
          : subjects;
        return setEntityOptions(list.map((x) => ({ id: x._id, label: x.name })));
      }

      // TOPIC
      if (type === "Topic") {
        const list = selectedChapterId
          ? topics.filter((t) => (t.chapter_id?._id || t.chapter_id) === selectedChapterId)
          : topics;
        return setEntityOptions(list.map((x) => ({ id: x._id, label: x.title })));
      }

      // GB CATEGORY
      if (type === "GB Category") {
        return setEntityOptions(gbCategories.map((x) => ({ id: x._id, label: x.name })));
      }

      // GB TOPIC
      if (type === "GB Topic") {
        const list = selectedGbCategoryId
          ? gbTopics.filter((t) => (t.gb_category_id?._id || t.gb_category_id) === selectedGbCategoryId)
          : gbTopics;
        return setEntityOptions(list.map((t) => ({ id: t._id, label: t.name })));
      }

      // GB SUBTOPIC
      if (type === "GB Subtopic") {
        const res = await getGBSubtopics({
          page: 1,
          limit: 500,
          gb_topic_id: selectedGbTopicId || undefined,
        }).catch(() => ({ data: [] }));

        return setEntityOptions(normalizeList(res).map((x: any) => ({ id: x._id, label: x.name })));
      }

      setEntityOptions([]);
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

  /* ---------- Form Helpers ---------- */

  const handleContentChange = (html: string) =>
    setForm({ ...form, content: html });

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (t: string) =>
    setForm({ ...form, tags: form.tags.filter((tag) => tag !== t) });

  const toggleLanguage = (id: string) =>
    setSupportedLanguageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.question.trim())
      return alert("Question is required");

    if (!form.answer.trim())
      return alert("Answer is required");

    onSubmit({ ...form, supported_language_ids: supportedLanguageIds });
  };

  /* ---------- UI helpers for selects ---------- */

  // Single function to render a SelectContent with no-items placeholder and style B highlighting
  const renderSelectContent = (
    items: Array<{ id: string; label: string }>,
    noItemsText = "No items found"
  ) => {
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
        <CardTitle>{initialData ? "Edit Short Question" : "Create Short Question"}</CardTitle>
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

              {/* Topic flow */}
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

              {/* Subtopic flow */}
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

              {/* Subject flow */}
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

              {/* GB flows */}
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

          {/* Answer */}
          <div className="space-y-2">
            <Label>Answer</Label>
            <Input
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Enter the answer"
              required
            />
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Input
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              placeholder="Explain why this answer is correct"
            />
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
            {loading ? "Saving..." : initialData ? "Update Short Question" : "Create Short Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ShortQuestionForm;

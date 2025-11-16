"use client";

import { useState, useEffect } from "react";
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

// --------------------------------------------------------------------
// 🔧 SAFETY HELPER — Fixes "type never" and makes all API calls safe
// --------------------------------------------------------------------
function normalizeList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.items && Array.isArray(res.items)) return res.items;
  return [];
}

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

export function MCQForm({
  onSubmit,
  loading = false,
  initialData,
  entityType,
  entityId,
}: MCQFormProps) {
  // --------------------------------------------------------------------
  // Form State
  // --------------------------------------------------------------------
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
    content:
      typeof initialData?.content === "string" ? initialData.content : "",
  });

  const [newTag, setNewTag] = useState("");

  // --------------------------------------------------------------------
  // Core Entity Collections
  // --------------------------------------------------------------------
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // --------------------------------------------------------------------
  // Selected hierarchy nodes
  // --------------------------------------------------------------------
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // --------------------------------------------------------------------
  // GB Entities
  // --------------------------------------------------------------------
  const [gbCategories, setGbCategories] = useState<any[]>([]);
  const [gbTopics, setGbTopics] = useState<any[]>([]);
  const [selectedGbCategoryId, setSelectedGbCategoryId] = useState("");
  const [selectedGbTopicId, setSelectedGbTopicId] = useState("");

  // --------------------------------------------------------------------
  // Language Entities
  // --------------------------------------------------------------------
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(
    initialData?.supported_language_ids || []
  );

  // Final entity list for entity_id dropdown
  const [entityOptions, setEntityOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);

  // --------------------------------------------------------------------
  // INITIAL PREFETCH of all lists
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // Load TOPICS when Chapter changes
  // --------------------------------------------------------------------
  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedChapterId) return setTopics([]);

      const list = await getTopics(selectedChapterId).catch(() => []);
      setTopics(normalizeList(list));
    };

    loadTopics();
  }, [selectedChapterId]);

  // --------------------------------------------------------------------
  // Load SUBTOPICS when Topic changes (for entity_type=Subtopic)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (form.entity_type !== "Subtopic") return;

    const load = async () => {
      if (!selectedTopicId) return setEntityOptions([]);

      const res = await getSubtopics(selectedTopicId).catch(() => []);
      setEntityOptions(
        normalizeList(res).map((x: any) => ({
          id: x._id,
          label: x.title || x.name,
        }))
      );
    };

    load();
  }, [selectedTopicId, form.entity_type]);

  // --------------------------------------------------------------------
  // Build entityOptions whenever entity_type changes
  // --------------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const type = form.entity_type || entityType;

      if (!type) return setEntityOptions([]);

      // CHAPTER ENTITY TYPE
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
          normalizeList(list).map((x: any) => ({
            id: x._id || x.id,
            label: x.name,
          }))
        );
      }

      // BOARD
      if (type === "Board") {
        return setEntityOptions(
          boards.map((x) => ({ id: x._id, label: x.name }))
        );
      }

      // CLASS
      if (type === "Class") {
        const list = selectedBoardId
          ? classes.filter(
              (cl) => (cl.board_id?._id || cl.board_id) === selectedBoardId
            )
          : classes;

        return setEntityOptions(
          list.map((x) => ({ id: x._id, label: x.name }))
        );
      }

      // SUBJECT
      if (type === "Subject") {
        const list = selectedClassId
          ? subjects.filter(
              (s) => (s.class_id?._id || s.class_id) === selectedClassId
            )
          : subjects;

        return setEntityOptions(
          list.map((x) => ({ id: x._id, label: x.name }))
        );
      }

      // TOPIC
      if (type === "Topic") {
        const list = selectedChapterId
          ? topics.filter(
              (t) => (t.chapter_id?._id || t.chapter_id) === selectedChapterId
            )
          : topics;

        return setEntityOptions(
          list.map((x) => ({ id: x._id, label: x.title }))
        );
      }

      // GB CATEGORY
      if (type === "GB Category") {
        return setEntityOptions(
          gbCategories.map((x) => ({
            id: x._id,
            label: x.name,
          }))
        );
      }

      // GB TOPIC
      if (type === "GB Topic") {
        const list = selectedGbCategoryId
          ? gbTopics.filter(
              (t) =>
                (t.gb_category_id?._id || t.gb_category_id) ===
                selectedGbCategoryId
            )
          : gbTopics;

        return setEntityOptions(
          list.map((x) => ({ id: x._id, label: x.name }))
        );
      }

      // GB SUBTOPIC
      if (type === "GB Subtopic") {
        const res = await getGBSubtopics({
          page: 1,
          limit: 500,
          gb_topic_id: selectedGbTopicId || undefined,
        }).catch(() => ({ data: [] }));

        return setEntityOptions(
          normalizeList(res).map((x: any) => ({
            id: x._id,
            label: x.name,
          }))
        );
      }

      setEntityOptions([]);
    };

    load();
  }, [
    form.entity_type,
    selectedBoardId,
    selectedClassId,
    selectedSubjectId,
    selectedChapterId,
    selectedGbCategoryId,
    selectedGbTopicId,
  ]);

  // --------------------------------------------------------------------
  // Form Helpers
  // --------------------------------------------------------------------
  const handleContentChange = (html: string) =>
    setForm({ ...form, content: html });

  const handleOptionChange = (i: number, field: "key" | "text", value: string) => {
    const opts = [...form.options];
    opts[i][field] = value;
    setForm({ ...form, options: opts });
  };

  const addOption = () => {
    const newKey = String.fromCharCode(65 + form.options.length);
    setForm({
      ...form,
      options: [...form.options, { key: newKey, text: "" }],
    });
  };

  const removeOption = (i: number) => {
    if (form.options.length <= 2) return;
    setForm({
      ...form,
      options: form.options.filter((_, idx) => idx !== i),
    });
  };

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

    if (form.options.length < 2)
      return alert("At least 2 options required");

    if (form.options.some((o) => !o.text.trim()))
      return alert("All options must have text");

    if (!form.options.find((o) => o.key === form.correct_answer))
      return alert("Correct answer must match an option key");

    onSubmit({ ...form, supported_language_ids: supportedLanguageIds });
  };

  // --------------------------------------------------------------------
  // UI Layout
  // --------------------------------------------------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit MCQ" : "Create MCQ"}</CardTitle>
      </CardHeader>

      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ENTITY TYPE */}
          {!entityType && (
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select
                value={form.entity_type}
                onValueChange={(v) =>
                  setForm({ ...form, entity_type: v, entity_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>

                <SelectContent>
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

          {/* ENTITY FILTERS */}
          {!entityId && (
            <div className="space-y-2">
              <Label>Entity</Label>

              {/* --------------------------------------
                  ENTITY TYPE: CHAPTER
                 -------------------------------------- */}
              {form.entity_type === "Chapter" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* BOARD */}
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

                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* CLASS */}
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

                    <SelectContent>
                      {classes
                        .filter(
                          (cl) =>
                            !selectedBoardId ||
                            (cl.board_id?._id || cl.board_id) === selectedBoardId
                        )
                        .map((cl) => (
                          <SelectItem key={cl._id} value={cl._id}>
                            {cl.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* SUBJECT */}
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

                    <SelectContent>
                      {subjects
                        .filter(
                          (s) =>
                            !selectedClassId ||
                            (s.class_id?._id || s.class_id) === selectedClassId
                        )
                        .map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* --------------------------------------
                  ENTITY TYPE: TOPIC
                 -------------------------------------- */}
              {form.entity_type === "Topic" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  {/* BOARD */}
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
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* CLASS */}
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

                    <SelectContent>
                      {classes
                        .filter(
                          (cl) =>
                            !selectedBoardId ||
                            (cl.board_id?._id || cl.board_id) === selectedBoardId
                        )
                        .map((cl) => (
                          <SelectItem key={cl._id} value={cl._id}>
                            {cl.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* SUBJECT */}
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

                    <SelectContent>
                      {subjects
                        .filter(
                          (s) =>
                            !selectedClassId ||
                            (s.class_id?._id || s.class_id) === selectedClassId
                        )
                        .map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* CHAPTER */}
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

                    <SelectContent>
                      {chapters
                        .filter((ch) => {
                          const matchesBoard =
                            !selectedBoardId ||
                            (ch.board_id?._id || ch.board_id) === selectedBoardId;

                          const matchesClass =
                            !selectedClassId ||
                            (ch.class_id?._id || ch.class_id) === selectedClassId;

                          const matchesSubject =
                            !selectedSubjectId ||
                            (ch.subject_id?._id || ch.subject_id) ===
                              selectedSubjectId;

                          return matchesBoard && matchesClass && matchesSubject;
                        })
                        .map((ch) => (
                          <SelectItem key={ch._id} value={ch._id}>
                            {ch.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* --------------------------------------
                  ENTITY TYPE: SUBTOPIC
                 -------------------------------------- */}
              {form.entity_type === "Subtopic" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {/* BOARD */}
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
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* CLASS */}
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
                    <SelectContent>
                      {classes
                        .filter(
                          (cl) =>
                            !selectedBoardId ||
                            (cl.board_id?._id || cl.board_id) === selectedBoardId
                        )
                        .map((cl) => (
                          <SelectItem key={cl._id} value={cl._id}>
                            {cl.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* SUBJECT */}
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
                    <SelectContent>
                      {subjects
                        .filter(
                          (s) =>
                            !selectedClassId ||
                            (s.class_id?._id || s.class_id) === selectedClassId
                        )
                        .map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {/* CHAPTER */}
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
         <SelectContent
  position="popper"
  className="max-h-64 overflow-y-auto bg-white border shadow-lg z-[9999]"
>
  {chapters
    .filter((ch) => {
      const matchesBoard =
        !selectedBoardId ||
        (ch.board_id?._id || ch.board_id) === selectedBoardId;

      const matchesClass =
        !selectedClassId ||
        (ch.class_id?._id || ch.class_id) === selectedClassId;

      const matchesSubject =
        !selectedSubjectId ||
        (ch.subject_id?._id || ch.subject_id) === selectedSubjectId;

      return matchesBoard && matchesClass && matchesSubject;
    })
    .map((ch) => (
      <SelectItem
        key={ch._id}
        value={ch._id}
        className="data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"
      >
        {ch.title}
      </SelectItem>
    ))}
</SelectContent>



                  </Select>

                  {/* TOPIC */}
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
                    <SelectContent>
                      {topics
                        .filter(
                          (t) =>
                            !selectedChapterId ||
                            (t.chapter_id?._id || t.chapter_id) ===
                              selectedChapterId
                        )
                        .map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* --------------------------------------
                  ENTITY TYPE: SUBJECT (Board → Class)
                 -------------------------------------- */}
              {form.entity_type === "Subject" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* BOARD */}
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
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* CLASS */}
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
                    <SelectContent>
                      {classes
                        .filter(
                          (cl) =>
                            !selectedBoardId ||
                            (cl.board_id?._id || cl.board_id) === selectedBoardId
                        )
                        .map((cl) => (
                          <SelectItem key={cl._id} value={cl._id}>
                            {cl.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* --------------------------------------
                  ENTITY TYPE: GB TOPIC / SUBTOPIC
                 -------------------------------------- */}
              {(form.entity_type === "GB Topic" ||
                form.entity_type === "GB Subtopic") && (
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
                    <SelectContent>
                      {gbCategories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {form.entity_type === "GB Subtopic" && (
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
                      <SelectContent>
                        {gbTopics
                          .filter(
                            (t) =>
                              !selectedGbCategoryId ||
                              (t.gb_category_id?._id || t.gb_category_id) ===
                                selectedGbCategoryId
                          )
                          .map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* FINAL ENTITY SELECT */}
              <Select
                value={form.entity_id}
                onValueChange={(value) =>
                  setForm({ ...form, entity_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.entity_type
                        ? `Select ${form.entity_type}`
                        : "Select entity"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {entityOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* SUPPORTED LANGUAGES */}
          <div className="space-y-2">
            <Label>Supported Languages</Label>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang._id}
                  type="button"
                  variant={
                    supportedLanguageIds.includes(lang._id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleLanguage(lang._id)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>

          {/* QUESTION */}
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={form.question}
              onChange={(e) =>
                setForm({ ...form, question: e.target.value })
              }
              placeholder="Enter the question"
              required
            />
          </div>

          {/* OPTIONS */}
          <div className="space-y-2">
            <Label>Options</Label>

            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={opt.key}
                  onChange={(e) =>
                    handleOptionChange(i, "key", e.target.value)
                  }
                  className="w-16"
                  placeholder="Key"
                />

                <Input
                  value={opt.text}
                  onChange={(e) =>
                    handleOptionChange(i, "text", e.target.value)
                  }
                  className="flex-1"
                  placeholder={`Option ${opt.key}`}
                />

                {form.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(i)}
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

          {/* CORRECT ANSWER */}
          <div className="space-y-2">
            <Label>Correct Answer</Label>

            <Select
              value={form.correct_answer}
              onValueChange={(v) =>
                setForm({ ...form, correct_answer: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>

              <SelectContent>
                {form.options.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.key}: {opt.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* EXPLANATION */}
          <div className="space-y-2">
            <Label>Explanation</Label>
            <Input
              value={form.explanation}
              onChange={(e) =>
                setForm({ ...form, explanation: e.target.value })
              }
              placeholder="Explain why this answer is correct"
            />
          </div>

          {/* DIFFICULTY */}
          <div className="space-y-2">
            <Label>Difficulty</Label>

            <Select
              value={form.difficulty}
              onValueChange={(v) =>
                setForm({ ...form, difficulty: v })
              }
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

          {/* TAGS */}
          <div className="space-y-2">
            <Label>Tags</Label>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />

              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={form.content}
              onChange={handleContentChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : initialData
              ? "Update MCQ"
              : "Create MCQ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

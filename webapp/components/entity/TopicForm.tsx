"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/rich-text-editor";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { getBoards } from "@/lib/api/entities/boards";
import { getClassesByBoard } from "@/lib/api/entities/classes";
import { getSubjects } from "@/lib/api/entities/subjects";
import { getChapters } from "@/lib/api/entities/chapters";
import { getLanguages } from "@/lib/api/entities/language";
import { formatSlug } from "@/lib/utils";

interface TopicFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    _id?: string;
    board_id?: string;
    class_id?: string;
    subject_id?: string;
    chapter_id?: string;
    chapter?: any; // Full chapter object for auto-populating hierarchy
    language_id?: string;
    supported_language_ids?: string[];
    title?: string;
    slug?: string;
    order?: number;
    is_published?: boolean;
    content?: string;
    tag?: string[];
    source?: string;
    author?: string;
    translations?: Array<{
      language_id: string;
      title: string;
      slug: string;
      content?: string;
    }>;
  };
}

export function TopicForm({ onSubmit, loading = false, initialData }: TopicFormProps) {
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState(
    Boolean(initialData?.flashcards)
  );
  const [mockTest, setMockTest] = useState(
    Boolean(initialData?.mock_test)
  );

  const handleFlashcardsChange = (checked: boolean) => {
    setFlashcards(checked);
  };

  const handleMockTestChange = (checked: boolean) => {
    setMockTest(checked);
    if (!checked) {
      // Clear mock test fields when toggle is off
      setFormData(f => ({ ...f, total_questions: undefined, total_time: undefined, pass_questions: undefined }));
    }
  };

  const [formData, setFormData] = useState({
    board_id: initialData?.board_id || "",
    class_id: initialData?.class_id || "",
    subject_id: initialData?.subject_id || "",
    chapter_id: initialData?.chapter_id || "",
    language_id: initialData?.language_id || "",
    supported_language_ids: initialData?.supported_language_ids || [],
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    order: initialData?.order ?? 0,
    is_published: initialData?.is_published ?? true,
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    tag: initialData?.tag?.join(', ') || '',
    source: initialData?.source || '',
    author: initialData?.author || '',
    flashcards: initialData?.flashcards || false,
    mock_test: initialData?.mock_test || false,
    total_questions: initialData?.total_questions || undefined,
    total_time: initialData?.total_time || undefined,
    pass_questions: initialData?.pass_questions || undefined,
  });


  // Check if we're adding from a parent chapter
  const isAddingFromParent = Boolean(initialData?.chapter);
  const parentChapter = initialData?.chapter;
  const parentSubject = parentChapter?.subject_id;
  const parentClass = parentSubject?.class_id;
  const parentBoard = parentClass?.board_id;

  // Check if we're editing existing topic (has _id) vs adding new topic (no _id)
  const isEditMode = Boolean(initialData && initialData._id);

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData && initialData._id) {
      // This is edit mode
      setFormData({
        board_id: initialData.board_id || "",
        class_id: initialData.class_id || "",
        subject_id: initialData.subject_id || "",
        chapter_id: initialData.chapter_id || "",
        language_id: initialData.language_id || "",
        supported_language_ids: initialData.supported_language_ids || [],
        title: initialData.title || "",
        slug: initialData.slug || "",
        order: initialData.order ?? 0,
        is_published: initialData.is_published ?? true,
        content: typeof initialData.content === 'string' ? initialData.content : '',
        tag: initialData.tag?.join(', ') || '',
        source: initialData.source || '',
        author: initialData.author || '',
        flashcards: initialData.flashcards ?? false,
        mock_test: initialData.mock_test ?? false,
        total_questions: initialData.total_questions ?? undefined,
        total_time: initialData.total_time ?? undefined,
        pass_questions: initialData.pass_questions ?? undefined,
      });
      
      // Update toggles
      setFlashcards(Boolean(initialData.flashcards));
      setMockTest(Boolean(initialData.mock_test));
    }
  }, [initialData]);

  // Auto-populate formData from parent chapter when adding from parent
  useEffect(() => {
    if (isAddingFromParent && parentChapter) {
      let subjectId = '';
      let classId = '';
      let boardId = '';
      
      // Extract subject ID
      if (typeof parentChapter.subject_id === 'object' && parentChapter.subject_id) {
        subjectId = parentChapter.subject_id._id || '';
        
        // Extract class ID from subject
        if (parentChapter.subject_id.class_id) {
          classId = typeof parentChapter.subject_id.class_id === 'object' 
            ? parentChapter.subject_id.class_id._id || ''
            : parentChapter.subject_id.class_id;
          
          // Extract board ID from class
          if (typeof parentChapter.subject_id.class_id === 'object' && parentChapter.subject_id.class_id.board_id) {
            boardId = typeof parentChapter.subject_id.class_id.board_id === 'object'
              ? parentChapter.subject_id.class_id.board_id._id || ''
              : parentChapter.subject_id.class_id.board_id;
          }
        }
      } else if (parentChapter.subject_id) {
        subjectId = parentChapter.subject_id;
      }
      
      // Fallback: try to get IDs from chapter's direct properties if nested data isn't available
      if (!classId && parentChapter.class_id) {
        classId = typeof parentChapter.class_id === 'object' ? parentChapter.class_id._id || '' : parentChapter.class_id;
      }
      if (!boardId && parentChapter.board_id) {
        boardId = typeof parentChapter.board_id === 'object' ? parentChapter.board_id._id || '' : parentChapter.board_id;
      }
      
      // Only update if we have all required IDs from parent
      if (boardId && classId && subjectId) {
        setFormData(prev => ({
          ...prev,
          board_id: boardId,
          class_id: classId,
          subject_id: subjectId,
          chapter_id: parentChapter._id || initialData?.chapter_id || '',
        }));
      }
    }
  }, [isAddingFromParent, parentChapter, initialData?.chapter_id]);

  // Load boards and languages on mount
  useEffect(() => {
    getBoards().then(setBoards);
    getLanguages().then((langs: any) => {
      const languagesArray = Array.isArray(langs)
        ? langs
        : Array.isArray(langs?.data)
        ? langs.data
        : [];
      if (!Array.isArray(langs) && !Array.isArray(langs?.data)) {
        console.warn('Languages API returned non-array data:', langs);
      }
      setLanguages(languagesArray);
    }).catch(error => {
      console.error('Error fetching languages:', error);
      setLanguages([]);
    });
  }, []);

  // Load classes when board changes
  useEffect(() => {
    if (formData.board_id) {
      getClassesByBoard(formData.board_id).then(setClasses);
    } else {
      setClasses([]);
    }
    // Don't reset when adding from parent or in edit mode
    if (!isEditMode && !isAddingFromParent) {
      setFormData(prev => ({ ...prev, class_id: "", subject_id: "", chapter_id: "" }));
      setSubjects([]);
      setChapters([]);
    }
  }, [formData.board_id, isEditMode, isAddingFromParent]);

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
    // Don't reset when adding from parent or in edit mode
    if (!isEditMode && !isAddingFromParent) {
      setFormData(prev => ({ ...prev, subject_id: "", chapter_id: "" }));
      setChapters([]);
    }
  }, [formData.class_id, isEditMode, isAddingFromParent]);

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
    // Don't reset when adding from parent or in edit mode
    if (!isEditMode && !isAddingFromParent) {
      setFormData(prev => ({ ...prev, chapter_id: "" }));
    }
  }, [formData.subject_id, isEditMode, isAddingFromParent]);

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

  // Handle supported languages change
  const handleSupportedLanguagesChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.supported_language_ids.includes(value);
      return {
        ...prev,
        supported_language_ids: exists
          ? prev.supported_language_ids.filter((id) => id !== value)
          : [...prev.supported_language_ids, value],
      };
    });
  };

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
      supported_language_ids: formData.supported_language_ids,
      title: formData.title,
      slug: formData.slug,
      order: Number(formData.order),
      is_published: formData.is_published,
      content: formData.content,
      tag: formData.tag ? formData.tag.split(',').map((t: string) => t.trim()) : [],
      source: formData.source,
      author: formData.author,
      flashcards: flashcards,
      mock_test: mockTest,
      total_questions: formData.total_questions,
      total_time: formData.total_time,
      pass_questions: formData.pass_questions,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?._id ? "Edit Topic" : "Create Topic"}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isAddingFromParent ? (
            <>
              <div className="space-y-2">
                <Label>Board</Label>
                <Input
                  value={typeof parentBoard === 'object' ? parentBoard?.name : boards.find(b => b._id === formData.board_id)?.name || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Input
                  value={typeof parentClass === 'object' ? parentClass?.name : classes.find(c => c._id === formData.class_id)?.name || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={parentSubject?.name || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Input
                  value={parentChapter?.title || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="language_id">Language</Label>
            <Select
              value={formData.language_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, language_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang._id} value={lang._id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supported Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang._id}
                  className={`px-2 py-1 rounded border text-xs ${
                    formData.supported_language_ids.includes(lang._id) 
                      ? "bg-blue-600 text-white" 
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                  onClick={() => handleSupportedLanguagesChange(lang._id)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
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
              onChange={(e) => {
                const formattedSlug = formatSlug(e.target.value);
                setFormData({ ...formData, slug: formattedSlug });
              }}
              placeholder="e.g., introduction or परिचय"
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
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tags (comma separated)</Label>
            <Input
              id="tag"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="Enter source"
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="flashcards"
                  checked={flashcards}
                  onCheckedChange={handleFlashcardsChange}
                />
                <Label htmlFor="flashcards" className="cursor-pointer">Flashcards</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mock_test"
                  checked={mockTest}
                  onCheckedChange={handleMockTestChange}
                />
                <Label htmlFor="mock_test" className="cursor-pointer">Mock Test</Label>
              </div>
            </div>
            {mockTest && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="total_questions">Total Questions</Label>
                  <Input
                    id="total_questions"
                    name="total_questions"
                    type="number"
                    value={formData.total_questions || ''}
                    onChange={(e) => setFormData({ ...formData, total_questions: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Enter total questions"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_time">Total Time (minutes)</Label>
                  <Input
                    id="total_time"
                    name="total_time"
                    type="number"
                    value={formData.total_time || ''}
                    onChange={(e) => setFormData({ ...formData, total_time: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Enter total time in minutes"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass_questions">Pass Questions</Label>
                  <Input
                    id="pass_questions"
                    name="pass_questions"
                    type="number"
                    value={formData.pass_questions || ''}
                    onChange={(e) => setFormData({ ...formData, pass_questions: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Enter minimum questions to pass"
                    min="1"
                  />
                </div>
              </div>
            )}
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

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={formData.content} onChange={(html) => setFormData({ ...formData, content: html })} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData?._id ? "Update Topic" : "Create Topic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



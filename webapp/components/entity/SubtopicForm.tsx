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
import { getTopics } from "@/lib/api/entities/topics";

interface SubtopicFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    _id?: string;
    board_id?: string;
    class_id?: string;
    subject_id?: string;
    chapter_id?: string;
    topic_id?: string;
    topic?: any; // Full topic object for auto-populating hierarchy
    language_id?: string;
    title?: string;
    slug?: string;
    order?: number;
    is_published?: boolean;
    content?: string;
    tag?: string[];
    source?: string;
    author?: string;
  };
}

export function SubtopicForm({ onSubmit, loading = false, initialData }: SubtopicFormProps) {
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    board_id: initialData?.board_id || "",
    class_id: initialData?.class_id || "",
    subject_id: initialData?.subject_id || "",
    chapter_id: initialData?.chapter_id || "",
    topic_id: initialData?.topic_id || "",
    language_id: initialData?.language_id || "",
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    order: initialData?.order ?? 0,
    is_published: initialData?.is_published ?? true,
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    tag: initialData?.tag?.join(', ') || '',
    source: initialData?.source || '',
    author: initialData?.author || '',
  });

  // Check if we're adding from a parent topic
  const isAddingFromParent = Boolean(initialData?.topic);
  const parentTopic = initialData?.topic;
  const parentChapter = parentTopic?.chapter_id;
  const parentSubject = parentChapter?.subject_id;
  const parentClass = parentSubject?.class_id;
  const parentBoard = parentClass?.board_id;

  // Check if we're editing existing subtopic (has _id) vs adding new subtopic (no _id)
  const isEditMode = Boolean(initialData && initialData._id);

  // Auto-populate formData from parent topic when adding from parent
  useEffect(() => {
    if (isAddingFromParent && parentTopic) {
      let chapterId = '';
      let subjectId = '';
      let classId = '';
      let boardId = '';
      
      // Extract chapter ID
      if (typeof parentTopic.chapter_id === 'object' && parentTopic.chapter_id) {
        chapterId = parentTopic.chapter_id._id || '';
        const chapter = parentTopic.chapter_id;
        
        // Extract subject ID from chapter
        if (chapter.subject_id) {
          subjectId = typeof chapter.subject_id === 'object' 
            ? chapter.subject_id._id || ''
            : chapter.subject_id;
          
          // Extract class ID from subject
          if (typeof chapter.subject_id === 'object' && chapter.subject_id.class_id) {
            classId = typeof chapter.subject_id.class_id === 'object'
              ? chapter.subject_id.class_id._id || ''
              : chapter.subject_id.class_id;
            
            // Extract board ID from class
            if (typeof chapter.subject_id.class_id === 'object' && chapter.subject_id.class_id.board_id) {
              boardId = typeof chapter.subject_id.class_id.board_id === 'object'
                ? chapter.subject_id.class_id.board_id._id || ''
                : chapter.subject_id.class_id.board_id;
            }
          }
        }
        
        // Fallback: try to get IDs from chapter's direct properties
        if (!subjectId && chapter.subject_id) {
          subjectId = typeof chapter.subject_id === 'object' ? chapter.subject_id._id || '' : chapter.subject_id;
        }
        if (!classId && chapter.class_id) {
          classId = typeof chapter.class_id === 'object' ? chapter.class_id._id || '' : chapter.class_id;
        }
        if (!boardId && chapter.board_id) {
          boardId = typeof chapter.board_id === 'object' ? chapter.board_id._id || '' : chapter.board_id;
        }
      } else if (parentTopic.chapter_id) {
        chapterId = parentTopic.chapter_id;
      }
      
      // Fallback: try to get IDs from topic's direct properties
      if (!subjectId && parentTopic.subject_id) {
        subjectId = typeof parentTopic.subject_id === 'object' ? parentTopic.subject_id._id || '' : parentTopic.subject_id;
      }
      if (!classId && parentTopic.class_id) {
        classId = typeof parentTopic.class_id === 'object' ? parentTopic.class_id._id || '' : parentTopic.class_id;
      }
      if (!boardId && parentTopic.board_id) {
        boardId = typeof parentTopic.board_id === 'object' ? parentTopic.board_id._id || '' : parentTopic.board_id;
      }
      
      // Only update if we have all required IDs from parent
      if (boardId && classId && subjectId && chapterId) {
        setFormData(prev => ({
          ...prev,
          board_id: boardId,
          class_id: classId,
          subject_id: subjectId,
          chapter_id: chapterId,
          topic_id: parentTopic._id || initialData?.topic_id || '',
        }));
      }
    }
  }, [isAddingFromParent, parentTopic, initialData?.topic_id]);

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
    // Don't reset when adding from parent or in edit mode
    if (!isEditMode && !isAddingFromParent) {
      setFormData(prev => ({ ...prev, class_id: "", subject_id: "", chapter_id: "", topic_id: "" }));
      setSubjects([]);
      setChapters([]);
      setTopics([]);
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
      setFormData(prev => ({ ...prev, subject_id: "", chapter_id: "", topic_id: "" }));
      setChapters([]);
      setTopics([]);
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
      setFormData(prev => ({ ...prev, chapter_id: "", topic_id: "" }));
      setTopics([]);
    }
  }, [formData.subject_id, isEditMode, isAddingFromParent]);

  // Load topics when chapter changes
  useEffect(() => {
    if (formData.chapter_id) {
      getTopics(formData.chapter_id).then((allTopics) => {
        setTopics(allTopics);
      }).catch(error => {
        console.error('Error fetching topics:', error);
        setTopics([]);
      });
    } else {
      setTopics([]);
    }
    // Don't reset when adding from parent or in edit mode
    if (!isEditMode && !isAddingFromParent) {
      setFormData(prev => ({ ...prev, topic_id: "" }));
    }
  }, [formData.chapter_id, isEditMode, isAddingFromParent]);

  // Auto-populate hierarchy in edit mode
  useEffect(() => {
    if (initialData && initialData.topic_id && boards.length > 0) {
      // Find the topic and populate the hierarchy
      getTopics().then((allTopics) => {
        const topic = allTopics.find((t: any) => t._id === initialData.topic_id);
        if (topic) {
          const chapterId = typeof topic.chapter_id === 'object' ? topic.chapter_id._id : topic.chapter_id;
          
          // Get chapter to find subject
          getChapters({ page: 1, limit: 100 }).then((result) => {
            const allChapters = result.data || result || [];
            const chapter = allChapters.find((c: any) => c._id === chapterId);
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
                chapter_id: chapterId || prev.chapter_id,
              }));
            }
          });
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
    if (!formData.topic_id) {
      alert('Please select a Topic');
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
    
    // Only send topic_id and language_id to the API, but maintain hierarchy for UX
    onSubmit({ 
      topic_id: formData.topic_id,
      language_id: formData.language_id,
      title: formData.title,
      slug: formData.slug,
      order: Number(formData.order),
      is_published: formData.is_published,
      content: formData.content,
      tag: formData.tag ? formData.tag.split(',').map((t: string) => t.trim()) : [],
      source: formData.source,
      author: formData.author
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?._id ? "Edit Subtopic" : "Create Subtopic"}</CardTitle>
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
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={parentTopic?.title || '-'}
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
                {isEditMode ? (
                  <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    {chapters.find((c) => c._id === formData.chapter_id)?.title || '-'}
                  </div>
                ) : (
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
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic_id">Topic</Label>
                <Select value={formData.topic_id} onValueChange={(value) => setFormData(prev => ({ ...prev, topic_id: value }))} disabled={!formData.chapter_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

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
              placeholder="Enter subtopic title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                const formattedSlug = e.target.value
                  .trim()
                  .replace(/\s+/g, '-')  // Replace spaces with hyphens
                  .replace(/[#?&%=+]/g, '')  // Remove URL problematic characters
                  .replace(/-+/g, '-')  // Replace multiple hyphens with single
                  .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
                setFormData({ ...formData, slug: formattedSlug });
              }}
              placeholder="e.g., basics or मूल बातें"
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
            {loading ? "Saving..." : initialData?._id ? "Update Subtopic" : "Create Subtopic"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



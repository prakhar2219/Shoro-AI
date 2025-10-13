import React, { useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { getBoards } from '@/lib/api/entities/boards';
import { getClassesByBoard } from '@/lib/api/entities/classes';
import { getSubjects } from '@/lib/api/entities/subjects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ChapterFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const ChapterForm: React.FC<ChapterFormProps> = ({ initialData, onSubmit, loading }) => {
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [form, setForm] = useState({
    board_id: typeof initialData?.board_id === 'object' ? initialData.board_id._id : initialData?.board_id || '',
    class_id: typeof initialData?.class_id === 'object' ? initialData.class_id._id : initialData?.class_id || '',
    subject_id: typeof initialData?.subject_id === 'object' ? initialData.subject_id._id : initialData?.subject_id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    order: initialData?.order || '',
    is_published: initialData?.is_published || false,
  });

  // Check if we're adding from a parent subject
  const isAddingFromParent = Boolean(initialData?.subject);
  const parentSubject = initialData?.subject;
  const parentClass = parentSubject?.class_id;
  const parentBoard = parentClass?.board_id;

  const isEditMode = Boolean(initialData && initialData._id);

  useEffect(() => {
    getBoards().then(setBoards);
  }, []);

  useEffect(() => {
    const boardId = typeof form.board_id === 'object' ? form.board_id._id : form.board_id;
    if (boardId) {
      getClassesByBoard(boardId).then(setClasses);
    } else {
      setClasses([]);
    }
    setForm((f) => ({ ...f, class_id: '', subject_id: '' }));
    setSubjects([]);
  }, [form.board_id]);

  useEffect(() => {
    const classId = typeof form.class_id === 'object' ? form.class_id._id : form.class_id;
    if (classId) {
      // Always fetch main subject data (no language_id)
      getSubjects(undefined).then((allSubjects) => {
        setSubjects(allSubjects.filter((s: any) => {
          const sClassId = typeof s.class_id === 'object' ? s.class_id._id : s.class_id;
          return sClassId === classId;
        }));
      });
    } else {
      setSubjects([]);
    }
    setForm((f) => ({ ...f, subject_id: '' }));
  }, [form.class_id]);

  useEffect(() => {
    if (initialData) {
      let boardId = '';
      let classId = '';
      let subjectId = '';
      
      // If adding from parent, extract full hierarchy
      if (initialData.subject) {
        subjectId = initialData.subject._id || '';
        const subjectClassId = initialData.subject.class_id;
        if (subjectClassId) {
          classId = typeof subjectClassId === 'object' ? subjectClassId._id : subjectClassId;
          const classBoardId = typeof subjectClassId === 'object' ? subjectClassId.board_id : '';
          if (classBoardId) {
            boardId = typeof classBoardId === 'object' ? classBoardId._id : classBoardId;
          }
        }
      } else if (initialData.class_id && typeof initialData.class_id === 'object') {
        classId = initialData.class_id._id || '';
        if (initialData.class_id.board_id) {
          boardId = typeof initialData.class_id.board_id === 'object'
            ? initialData.class_id.board_id._id || ''
            : initialData.class_id.board_id;
        }
      } else if (initialData.class_id) {
        classId = initialData.class_id;
      }
      if (initialData.subject_id && typeof initialData.subject_id === 'object') {
        subjectId = initialData.subject_id._id || '';
      } else if (initialData.subject_id) {
        subjectId = initialData.subject_id;
      }
      setForm(f => ({
        ...f,
        board_id: typeof initialData.board_id === 'object' ? initialData.board_id._id : initialData.board_id || boardId,
        class_id: classId,
        subject_id: subjectId,
      }));
    }
    // eslint-disable-next-line
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for slug field
    if (name === 'slug') {
      const formattedSlug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''); 
      setForm({ ...form, [name]: formattedSlug });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBoardChange = (value: string) => {
    setForm(f => ({ ...f, board_id: value, class_id: '', subject_id: '' }));
  };

  const handleClassChange = (value: string) => {
    setForm(f => ({ ...f, class_id: value, subject_id: '' }));
  };

  const handleSubjectChange = (value: string) => {
    setForm(f => ({ ...f, subject_id: value }));
  };

  const handleContentChange = (html: string) => {
    setForm({ ...form, content: html });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData && initialData._id ? 'Edit Chapter' : 'Create Chapter'}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[80vh] overflow-y-auto pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isAddingFromParent ? (
            <>
              <div className="space-y-2">
                <Label>Board</Label>
                <Input
                  value={typeof parentBoard === 'object' ? parentBoard?.name : boards.find(b => b._id === form.board_id)?.name || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Input
                  value={typeof parentClass === 'object' ? parentClass?.name : classes.find(c => c._id === form.class_id)?.name || '-'}
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
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="board_id">Board</Label>
                {isEditMode ? (
                  <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    {boards.find((b) => b._id === form.board_id)?.name || (typeof form.board_id === 'object' ? form.board_id.name : form.board_id) || '-'}
                  </div>
                ) : (
                  <Select value={form.board_id} onValueChange={handleBoardChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b._id} value={b._id as string}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_id">Class</Label>
                {isEditMode ? (
                  <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    {classes.find((cls) => cls._id === form.class_id)?.name || (typeof form.class_id === 'object' ? form.class_id.name : form.class_id) || '-'}
                  </div>
                ) : (
                  <Select value={form.class_id} onValueChange={handleClassChange} disabled={!form.board_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id as string}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject_id">Subject</Label>
                {isEditMode ? (
                  <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    {subjects.find((s) => s._id === form.subject_id)?.name || (typeof form.subject_id === 'object' ? form.subject_id.name : form.subject_id) || '-'}
                  </div>
                ) : (
                  <Select value={form.subject_id} onValueChange={handleSubjectChange} disabled={!form.class_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s._id} value={s._id as string}>{s.name} ({s.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter chapter title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="chapter-title-slug"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              placeholder="SEO title for this chapter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Input
              id="seo_description"
              name="seo_description"
              value={form.seo_description}
              onChange={handleChange}
              placeholder="SEO description for this chapter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              placeholder="Enter order"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="is_published"
              name="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
            />
            <Label htmlFor="is_published">Is Published</Label>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : initialData ? 'Update Chapter' : 'Create Chapter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 
import React, { useEffect, useState } from 'react';
import { getBoards, IBoard } from '@/lib/api/entities/boards';
import { getClassesByBoard, getClass, IClass } from '@/lib/api/entities/classes';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';
import { getLanguages } from '@/lib/api/entities/language';

interface SubjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ initialData, onSubmit, loading }) => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(initialData?.supported_language_ids || []);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    book_name: initialData?.book_name || '',
    code: initialData?.code || '',
    icon: initialData?.icon || '',
    board_id: initialData?.board_id || '',
    class_id: initialData?.class_id || '',
    language_id: initialData?.language_id || '',
    downloadNotes: initialData?.downloadNotes || '',
    downloadPDF: initialData?.downloadPDF || '',
    downloadQA: initialData?.downloadQA || '',
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    tag: initialData?.tag?.join(', ') || '',
    source: initialData?.source || '',
    author: initialData?.author || '',
  });
  
  // Check if we're adding from a parent class
  const isAddingFromParent = Boolean(initialData?.classItem);
  const parentClass = initialData?.classItem;
  const parentBoard = parentClass?.board_id;

  useEffect(() => {
    getBoards().then(setBoards);
    getLanguages().then((langs: any) => {
      const languagesArray = Array.isArray(langs) 
        ? langs 
        : Array.isArray(langs?.data) 
        ? langs.data 
        : [];
      setLanguages(languagesArray);
    }).catch(() => setLanguages([]));
  }, []);

  useEffect(() => {
    if (form.board_id) {
      getClassesByBoard(form.board_id).then(setClasses);
    } else {
      setClasses([]);
    }
  }, [form.board_id]);

  // Ensure language is preselected on edit if missing in the form state
  useEffect(() => {
    if (initialData) {
      const current = form.language_id;
      let initialLang = '';
      if (typeof initialData.language_id === 'object' && initialData.language_id) {
        initialLang = initialData.language_id._id || '';
      } else if (typeof initialData.language_id === 'string') {
        initialLang = initialData.language_id;
      }
      if (!current && initialLang) {
        setForm(f => ({ ...f, language_id: initialLang }));
      }
    }
  }, [initialData, form.language_id]);

  // When editing: if class_id is known but board_id is empty, resolve board from class
  useEffect(() => {
    const resolveBoardFromClass = async () => {
      if (!initialData) return;
      if (!form.board_id && form.class_id) {
        try {
          const cls = await getClass(form.class_id);
          const resolvedBoardId = (cls.board_id as any)?._id || (cls.board_id as any) || '';
          if (resolvedBoardId) {
            setForm(f => ({ ...f, board_id: resolvedBoardId }));
            const list = await getClassesByBoard(resolvedBoardId);
            setClasses(list);
          }
        } catch {}
      }
    };
    resolveBoardFromClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.class_id]);

  useEffect(() => {
    if (initialData) {
      let boardId = '';
      let classId = '';
      let languageId = '';
      
      // If adding from parent, extract board and class info
      if (initialData.classItem) {
        classId = initialData.classItem._id || '';
        boardId = typeof initialData.classItem.board_id === 'object'
          ? initialData.classItem.board_id._id || ''
          : initialData.classItem.board_id || '';
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

      // Extract language_id from potentially populated object
      if (typeof initialData.language_id === 'object' && initialData.language_id !== null) {
        languageId = initialData.language_id._id || '';
      } else {
        languageId = initialData.language_id || '';
      }

      setForm(f => ({
        ...f,
        name: initialData.name || f.name,
        book_name: initialData.book_name || f.book_name,
        code: initialData.code || f.code,
        icon: initialData.icon || f.icon,
        board_id: boardId || f.board_id,
        class_id: classId || f.class_id,
        language_id: languageId,
        downloadNotes: initialData.downloadNotes || f.downloadNotes,
        downloadPDF: initialData.downloadPDF || f.downloadPDF,
        downloadQA: initialData.downloadQA || f.downloadQA,
        content: typeof initialData.content === 'string' ? initialData.content : f.content,
        tag: initialData.tag?.join(', ') || f.tag,
        source: initialData.source || f.source,
        author: initialData.author || f.author,
      }));
      
      // Update supported language IDs
      setSupportedLanguageIds(initialData.supported_language_ids || []);
    }
    // eslint-disable-next-line
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBoardChange = (value: string) => {
    setForm(f => ({ ...f, board_id: value, class_id: '' }));
  };

  const handleClassChange = (value: string) => {
    setForm(f => ({ ...f, class_id: value }));
  };

  const handleLanguageChange = (value: string) => {
    setForm(f => ({ ...f, language_id: value }));
  };

  const handleContentChange = (html: string) => {
    setForm({ ...form, content: html });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tag: form.tag ? form.tag.split(',').map((t: string) => t.trim()) : [],
      supported_language_ids: supportedLanguageIds
    };
    onSubmit(payload);
  };
  
  const handleSupportedLanguagesChange = (value: string) => {
    setSupportedLanguageIds((prev) => {
      const exists = prev.includes(value);
      return exists
        ? prev.filter((id) => id !== value)
        : [...prev, value];
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?._id ? 'Edit Subject' : 'Create Subject'}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
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
                  value={parentClass?.name || '-'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="board_id">Board</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_id">Class</Label>
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
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="language_id">Language</Label>
            <LanguageSelector
              value={form.language_id}
              onValueChange={handleLanguageChange}
              placeholder="Select Language"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Supported Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Button
                  key={lang._id}
                  type="button"
                  variant={supportedLanguageIds.includes(lang._id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSupportedLanguagesChange(lang._id)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter subject name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book_name">Book Name</Label>
            <Input
              id="book_name"
              name="book_name"
              value={form.book_name}
              onChange={handleChange}
              placeholder="Enter book name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g., MATH, SCI"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="Paste emoji or icon URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="Enter author name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag">Tags (comma separated)</Label>
            <Input
              id="tag"
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="Enter source"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downloadNotes">Download Notes (URL)</Label>
            <Input
              id="downloadNotes"
              name="downloadNotes"
              value={form.downloadNotes}
              onChange={handleChange}
              placeholder="https://example.com/notes.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downloadPDF">Download PDF (URL)</Label>
            <Input
              id="downloadPDF"
              name="downloadPDF"
              value={form.downloadPDF}
              onChange={handleChange}
              placeholder="https://example.com/document.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downloadQA">Download Q&A (URL)</Label>
            <Input
              id="downloadQA"
              name="downloadQA"
              value={form.downloadQA}
              onChange={handleChange}
              placeholder="https://example.com/qa.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : initialData?._id ? 'Update Subject' : 'Create Subject'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 
import React, { useEffect, useState } from 'react';
import { getBoards, IBoard } from '@/lib/api/entities/boards';
import { getClassesByBoard, IClass } from '@/lib/api/entities/classes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';

interface SubjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ initialData, onSubmit, loading }) => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    icon: initialData?.icon || '',
    board_id: initialData?.board_id || '',
    class_id: initialData?.class_id || '',
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  useEffect(() => {
    getBoards().then(setBoards);
  }, []);

  useEffect(() => {
    if (form.board_id) {
      getClassesByBoard(form.board_id).then(setClasses);
    } else {
      setClasses([]);
    }
  }, [form.board_id]);

  useEffect(() => {
    if (initialData) {
      let boardId = '';
      let classId = '';
      if (initialData.class_id && typeof initialData.class_id === 'object') {
        classId = initialData.class_id._id || '';
        if (initialData.class_id.board_id) {
          boardId = typeof initialData.class_id.board_id === 'object'
            ? initialData.class_id.board_id._id || ''
            : initialData.class_id.board_id;
        }
      } else if (initialData.class_id) {
        classId = initialData.class_id;
      }
      setForm(f => ({
        ...f,
        board_id: boardId,
        class_id: classId,
      }));
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

  const handleContentChange = (json: any) => {
    setForm({ ...form, content: json });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Subject' : 'Create Subject'}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 
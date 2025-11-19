'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';
import { getLanguages } from '@/lib/api/entities/language';
import { formatSlug } from '@/lib/utils';

interface GBTopicFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function GBTopicForm({ initialData = {}, onSubmit, loading = false }: GBTopicFormProps) {
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(initialData?.supported_language_ids || []);
  const [flashcards, setFlashcards] = useState(Boolean(initialData?.flashcards));
  const [mockTest, setMockTest] = useState(Boolean(initialData?.mock_test));

  const handleFlashcardsChange = (checked: boolean) => {
    setFlashcards(checked);
  };

  const handleMockTestChange = (checked: boolean) => {
    setMockTest(checked);
    if (!checked) {
      setFormData(f => ({ ...f, total_questions: undefined, total_time: undefined, pass_questions: undefined }));
    }
  };
  
  const [formData, setFormData] = useState({
    gb_category_id: '',
    name: '',
    slug: '',
    description: '',
    content: '',
    language_id: '',
    order: 0,
    image: '',
    tag: '',
    source: '',
    author: '',
    is_published: false,
    flashcards: false,
    mock_test: false,
    total_questions: undefined,
    total_time: undefined,
    pass_questions: undefined,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Check if we're in "add from parent" mode (when gb_category is passed)
  const isAddingFromParent = Boolean(initialData?.gb_category);
  // Edit mode flag
  const isEditMode = Boolean(initialData && initialData._id);

  useEffect(() => {
    // Fetch languages
    getLanguages().then((langs: any) => {
      const languagesArray = Array.isArray(langs) 
        ? langs 
        : Array.isArray(langs?.data) 
        ? langs.data 
        : [];
      setLanguages(languagesArray);
    }).catch(() => setLanguages([]));

    // Fetch GB Categories for dropdown
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v1/content/gb-categories');
        const data = await response.json();
        if (response.ok) {
          setCategories(data.data || data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      // If gb_category is passed, we're adding from parent
      if (initialData.gb_category) {
        setSelectedCategory(initialData.gb_category);
      }
      
      setFormData({
        gb_category_id: typeof initialData.gb_category_id === 'object' ? initialData.gb_category_id?._id || '' : initialData.gb_category_id || '',
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        content: initialData.content || '',
        language_id: typeof initialData.language_id === 'object' ? initialData.language_id?._id || '' : initialData.language_id || '',
        order: initialData.order || 0,
        image: initialData.image || '',
        tag: initialData.tag?.join(', ') || '',
        source: initialData.source || '',
        author: initialData.author || '',
        is_published: initialData.is_published || false,
        flashcards: initialData.flashcards ?? false,
        mock_test: initialData.mock_test ?? false,
        total_questions: initialData.total_questions ?? undefined,
        total_time: initialData.total_time ?? undefined,
        pass_questions: initialData.pass_questions ?? undefined,
      });
      setSupportedLanguageIds(initialData.supported_language_ids || []);
      setFlashcards(Boolean(initialData.flashcards));
      setMockTest(Boolean(initialData.mock_test));
    }
  }, [initialData?._id, initialData?.gb_category_id]); // Only depend on stable IDs to prevent infinite loops

  // Ensure language is preselected on edit if missing in the form state
  useEffect(() => {
    if (initialData) {
      const current = formData.language_id as any;
      let initialLang = '' as any;
      if (typeof initialData.language_id === 'object' && initialData.language_id) {
        initialLang = initialData.language_id._id || '';
      } else if (typeof initialData.language_id === 'string') {
        initialLang = initialData.language_id;
      }
      if (!current && initialLang) {
        setFormData(prev => ({ ...prev, language_id: initialLang }));
      }
    }
  }, [initialData, formData.language_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.gb_category_id) {
      alert('Please select a GB Category');
      return;
    }
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    if (!formData.language_id) {
      alert('Please select a language');
      return;
    }
    if (!formData.order || formData.order < 0) {
      alert('Please enter a valid order number');
      return;
    }
    
    const payload = {
      ...formData,
      tag: formData.tag ? formData.tag.split(',').map(t => t.trim()) : [],
      order: Number(formData.order),
      supported_language_ids: supportedLanguageIds,
      flashcards: flashcards,
      mock_test: mockTest,
      total_questions: formData.total_questions,
      total_time: formData.total_time,
      pass_questions: formData.pass_questions,
    };

    await onSubmit(payload);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => {
              const formattedSlug = formatSlug(e.target.value);
              setFormData({ ...formData, slug: formattedSlug });
            }}
            placeholder="e.g., ai-basics or कृत्रिम-बुद्धिमत्ता"
            required
          />
        </div>
      </div>

      {isAddingFromParent && selectedCategory ? (
        <div>
          <Label>GB Category</Label>
          <Input
            value={selectedCategory.name}
            disabled
            className="bg-gray-100"
          />
        </div>
      ) : isEditMode ? (
        <div>
          <Label>GB Category</Label>
          <Input
            value={
              (typeof initialData.gb_category_id === 'object' && initialData.gb_category_id?.name) ||
              categories.find((c: any) => c._id === formData.gb_category_id)?.name ||
              '-'
            }
            disabled
            className="bg-gray-100"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="gb_category_id">GB Category *</Label>
          <Select value={formData.gb_category_id} onValueChange={(value) => setFormData({ ...formData, gb_category_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select GB Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="language_id">Language *</Label>
        <LanguageSelector
          value={formData.language_id}
          onValueChange={(value) => setFormData({ ...formData, language_id: value })}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="tag">Tags (comma separated)</Label>
        <Input
          id="tag"
          value={formData.tag}
          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div>
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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

      <div>
        <Label htmlFor="content">Content</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(html) => setFormData({ ...formData, content: html })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: !!checked })}
        />
        <Label htmlFor="is_published">Published</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

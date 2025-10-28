'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { RichTextEditor } from '@/components/rich-text-editor';
import { getLanguages } from '@/lib/api/entities/language';

interface GBCategoryFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function GBCategoryForm({ initialData = {}, onSubmit, loading = false }: GBCategoryFormProps) {
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(initialData?.supported_language_ids || []);
  
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
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
    if (initialData) {
      setFormData({
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
      });
      setSupportedLanguageIds(initialData.supported_language_ids || []);
    }
  }, [initialData?._id]); // Only depend on _id to prevent infinite loops

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
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
      supported_language_ids: supportedLanguageIds
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
              const formattedSlug = e.target.value
                .trim()
                .replace(/\s+/g, '-')  // Replace spaces with hyphens
                .replace(/[#?&%=+]/g, '')  // Remove URL problematic characters
                .replace(/-+/g, '-')  // Replace multiple hyphens with single
                .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
              setFormData({ ...formData, slug: formattedSlug });
            }}
            placeholder="e.g., technology or प्रौद्योगिकी"
            required
          />
        </div>
      </div>

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

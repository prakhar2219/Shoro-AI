'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';

interface GBTopicFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function GBTopicForm({ initialData = {}, onSubmit, loading = false }: GBTopicFormProps) {
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
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Check if we're in "add from parent" mode (when gb_category is passed)
  const isAddingFromParent = Boolean(initialData?.gb_category);

  useEffect(() => {
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
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      tag: formData.tag ? formData.tag.split(',').map(t => t.trim()) : [],
      order: Number(formData.order),
    };

    await onSubmit(payload);
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
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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

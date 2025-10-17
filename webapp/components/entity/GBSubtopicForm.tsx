'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';

interface GBSubtopicFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function GBSubtopicForm({ initialData = {}, onSubmit, loading = false }: GBSubtopicFormProps) {
  const [formData, setFormData] = useState({
    gb_category_id: '',
    gb_topic_id: '',
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
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Check if we're editing existing subtopic (has _id) vs adding new subtopic (no _id)
  const isEditMode = Boolean(initialData && initialData._id);
  const isAddingFromParent = Boolean(initialData?.gb_topic);

  // Load categories on mount
  useEffect(() => {
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

  // Load topics when category changes
  useEffect(() => {
    if (formData.gb_category_id) {
      const fetchTopics = async () => {
        try {
          const response = await fetch('/api/v1/content/gb-topics');
          const data = await response.json();
          if (response.ok) {
            const allTopics = data.data || data || [];
            setTopics(allTopics.filter((t: any) => {
              const tCategoryId = typeof t.gb_category_id === 'object' ? t.gb_category_id._id : t.gb_category_id;
              return tCategoryId === formData.gb_category_id;
            }));
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      fetchTopics();
    } else {
      setTopics([]);
    }
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, gb_topic_id: '' }));
    }
  }, [formData.gb_category_id, isEditMode]);

  // Auto-populate hierarchy in edit mode
  useEffect(() => {
    if (initialData && initialData.gb_topic_id && categories.length > 0) {
      // Find the topic and populate the hierarchy
      const fetchTopicDetails = async () => {
        try {
          const response = await fetch('/api/v1/content/gb-topics');
          const data = await response.json();
          if (response.ok) {
            const allTopics = data.data || data || [];
            const topic = allTopics.find((t: any) => t._id === initialData.gb_topic_id);
            if (topic) {
              const categoryId = typeof topic.gb_category_id === 'object' ? topic.gb_category_id._id : topic.gb_category_id;
              setFormData(prev => ({
                ...prev,
                gb_category_id: categoryId || prev.gb_category_id,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching topic details:', error);
        }
      };
      fetchTopicDetails();
    }
  }, [initialData, categories]);

  useEffect(() => {
    if (initialData) {
      // If gb_topic is passed, we're adding from parent
      if (initialData.gb_topic) {
        setSelectedTopic(initialData.gb_topic);
        const categoryId = typeof initialData.gb_topic.gb_category_id === 'object' 
          ? initialData.gb_topic.gb_category_id._id 
          : initialData.gb_topic.gb_category_id;
        const category = typeof initialData.gb_topic.gb_category_id === 'object'
          ? initialData.gb_topic.gb_category_id
          : null;
        if (category) {
          setSelectedCategory(category);
        }
        setFormData(prev => ({
          ...prev,
          gb_category_id: categoryId || '',
          gb_topic_id: initialData.gb_topic._id || '',
        }));
      } else {
        setFormData({
          gb_category_id: initialData.gb_category_id || '',
          gb_topic_id: typeof initialData.gb_topic_id === 'object' ? initialData.gb_topic_id?._id || '' : initialData.gb_topic_id || '',
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
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.gb_category_id) {
      alert('Please select a GB Category');
      return;
    }
    if (!formData.gb_topic_id) {
      alert('Please select a GB Topic');
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
    
    // Only send gb_topic_id to the API, but maintain hierarchy for UX
    const payload = {
      gb_topic_id: formData.gb_topic_id,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      content: formData.content,
      language_id: formData.language_id,
      order: Number(formData.order),
      image: formData.image,
      tag: formData.tag ? formData.tag.split(',').map(t => t.trim()) : [],
      source: formData.source,
      author: formData.author,
      is_published: formData.is_published,
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
            onChange={(e) => {
              const formattedSlug = e.target.value
                .trim()
                .replace(/\s+/g, '-')  // Replace spaces with hyphens
                .replace(/[#?&%=+]/g, '')  // Remove URL problematic characters
                .replace(/-+/g, '-')  // Replace multiple hyphens with single
                .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
              setFormData({ ...formData, slug: formattedSlug });
            }}
            placeholder="e.g., neural-networks or तंत्रिका-जाल"
            required
          />
        </div>
      </div>

      {isAddingFromParent ? (
        <>
          <div>
            <Label>GB Category</Label>
            <Input
              value={selectedCategory?.name || (typeof selectedTopic?.gb_category_id === 'object' ? selectedTopic.gb_category_id.name : '-')}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label>GB Topic</Label>
            <Input
              value={selectedTopic?.name || '-'}
              disabled
              className="bg-gray-100"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="gb_category_id">GB Category</Label>
            {isEditMode ? (
              <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                {categories.find((c) => c._id === formData.gb_category_id)?.name || '-'}
              </div>
            ) : (
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
            )}
          </div>

          <div>
            <Label htmlFor="gb_topic_id">GB Topic *</Label>
            <Select value={formData.gb_topic_id} onValueChange={(value) => setFormData({ ...formData, gb_topic_id: value })} disabled={!formData.gb_category_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select GB Topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
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

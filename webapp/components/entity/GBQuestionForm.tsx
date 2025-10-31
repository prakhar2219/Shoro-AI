'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/rich-text-editor';
import { getLanguages } from '@/lib/api/entities/language';

interface GBQuestionFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function GBQuestionForm({ initialData = {}, onSubmit, loading = false }: GBQuestionFormProps) {
  const [languages, setLanguages] = useState<any[]>([]);
  const [supportedLanguageIds, setSupportedLanguageIds] = useState<string[]>(initialData?.supported_language_ids || []);
  
  const [formData, setFormData] = useState({
    gb_category_id: '',
    gb_topic_id: '',
    gb_subtopic_id: '',
    question: '',
    slug: '',
    answer: '',
    content: '',
    language_id: '',
    order: 0,
    image: '',
    tag: '',
    source: '',
    author: '',
    difficulty_level: 'medium' as 'easy' | 'medium' | 'hard',
    is_published: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);

  // Check if we're editing existing question (has _id) vs adding new question (no _id)
  const isEditMode = Boolean(initialData && initialData._id);

  // Load categories and languages on mount
  useEffect(() => {
    getLanguages().then((langs: any) => {
      const languagesArray = Array.isArray(langs) 
        ? langs 
        : Array.isArray(langs?.data) 
        ? langs.data 
        : [];
      setLanguages(languagesArray);
    }).catch(() => setLanguages([]));

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
          const response = await fetch('/api/v1/content/gb-topics?limit=10000&page=1');
          const data = await response.json();
          if (response.ok) {
            const allTopics = data.data || data || [];
            const filtered = allTopics.filter((t: any) => {
              const tCategoryId = typeof t.gb_category_id === 'object' ? t.gb_category_id._id : t.gb_category_id;
              return tCategoryId === formData.gb_category_id;
            });
            setTopics(filtered);
            // If we already know a topic id (edit mode), set selectedTopic for display
            if (formData.gb_topic_id) {
              const t = filtered.find((x: any) => x._id === formData.gb_topic_id);
              if (t) setSelectedTopic(t);
            }
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
      setFormData(prev => ({ ...prev, gb_topic_id: '', gb_subtopic_id: '' }));
      setSubtopics([]);
    }
  }, [formData.gb_category_id, isEditMode]);

  // Load subtopics when topic changes
  useEffect(() => {
    if (formData.gb_topic_id) {
      const fetchSubtopics = async () => {
        try {
          const response = await fetch('/api/v1/content/gb-subtopics?limit=10000&page=1');
          const data = await response.json();
          if (response.ok) {
            const allSubtopics = data.data || data || [];
            const filtered = allSubtopics.filter((s: any) => {
              const sTopicId = typeof s.gb_topic_id === 'object' ? s.gb_topic_id._id : s.gb_topic_id;
              return sTopicId === formData.gb_topic_id;
            });
            setSubtopics(filtered);
          }
        } catch (error) {
          console.error('Error fetching subtopics:', error);
        }
      };
      fetchSubtopics();
    } else {
      setSubtopics([]);
    }
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, gb_subtopic_id: '' }));
    }
  }, [formData.gb_topic_id, isEditMode]);

  // Auto-populate hierarchy in edit mode
  useEffect(() => {
    if (initialData && initialData.gb_subtopic_id && categories.length > 0) {
      // Find the subtopic and populate the hierarchy
      const fetchHierarchy = async () => {
        try {
          const subtopicResponse = await fetch('/api/v1/content/gb-subtopics?limit=10000&page=1');
          const subtopicData = await subtopicResponse.json();
          if (subtopicResponse.ok) {
            const allSubtopics = subtopicData.data || subtopicData || [];
            const subtopic = allSubtopics.find((s: any) => s._id === initialData.gb_subtopic_id);
            if (subtopic) {
              const topicId = typeof subtopic.gb_topic_id === 'object' ? subtopic.gb_topic_id._id : subtopic.gb_topic_id;
              
              // Get topic to find category
              const topicResponse = await fetch('/api/v1/content/gb-topics?limit=10000&page=1');
              const topicData = await topicResponse.json();
              if (topicResponse.ok) {
                const allTopics = topicData.data || topicData || [];
                const topic = allTopics.find((t: any) => t._id === topicId);
                if (topic) {
                  const categoryId = typeof topic.gb_category_id === 'object' ? topic.gb_category_id._id : topic.gb_category_id;
                  
                  setFormData(prev => ({
                    ...prev,
                    gb_category_id: categoryId || prev.gb_category_id,
                    gb_topic_id: topicId || prev.gb_topic_id,
                  }));
                  setSelectedTopic(topic);
                  if (typeof topic.gb_category_id === 'object') {
                    setSelectedCategory(topic.gb_category_id);
                  } else {
                    const cat = categories.find((c: any) => c._id === categoryId);
                    if (cat) setSelectedCategory(cat);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching hierarchy:', error);
        }
      };
      fetchHierarchy();
    }
  }, [initialData?._id, initialData?.gb_subtopic_id, categories]); // Only depend on stable IDs to prevent infinite loops

  // Ensure subtopics load in edit mode even if formData.gb_topic_id was set before hooks ran
  useEffect(() => {
    const loadSubtopicsForEdit = async () => {
      if (!isEditMode) return;
      const topicId = formData.gb_topic_id;
      if (!topicId) return;
      try {
        const response = await fetch(`/api/v1/content/gb-subtopics?limit=10000&page=1`);
        const data = await response.json();
        if (response.ok) {
          const all = data.data || data || [];
          const filtered = all.filter((s: any) => (typeof s.gb_topic_id === 'object' ? s.gb_topic_id._id : s.gb_topic_id) === topicId);
          setSubtopics(filtered);
        }
      } catch {}
    };
    loadSubtopicsForEdit();
  }, [isEditMode, formData.gb_topic_id]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        gb_category_id: initialData.gb_category_id || '',
        gb_topic_id: initialData.gb_topic_id || '',
        gb_subtopic_id: typeof initialData.gb_subtopic_id === 'object' ? initialData.gb_subtopic_id?._id || '' : initialData.gb_subtopic_id || '',
        question: initialData.question || '',
        slug: initialData.slug || '',
        answer: initialData.answer || '',
        content: initialData.content || '',
        language_id: typeof initialData.language_id === 'object' ? initialData.language_id?._id || '' : initialData.language_id || '',
        order: initialData.order || 0,
        image: initialData.image || '',
        tag: initialData.tag?.join(', ') || '',
        source: initialData.source || '',
        author: initialData.author || '',
        difficulty_level: initialData.difficulty_level || 'medium',
        is_published: initialData.is_published || false,
      });
      setSupportedLanguageIds(initialData.supported_language_ids || []);
    }
  }, [initialData?._id, initialData?.gb_subtopic_id]); // Only depend on stable IDs to prevent infinite loops

  const handleContentChange = (html: string) => {
    setFormData({ ...formData, content: html });
  };

  const handleAnswerChange = (html: string) => {
    setFormData({ ...formData, answer: html });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.gb_subtopic_id) {
      alert('Please select a GB Subtopic');
      return;
    }
    if (!formData.question.trim()) {
      alert('Please enter a question');
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
    
    // Only send gb_subtopic_id to the API, but maintain hierarchy for UX
    const payload = {
      gb_subtopic_id: formData.gb_subtopic_id,
      question: formData.question.trim(),
      slug: formData.slug.trim(),
      answer: formData.answer,
      content: formData.content,
      language_id: formData.language_id,
      order: Number(formData.order),
      image: formData.image,
      tag: formData.tag ? formData.tag.split(',').map(t => t.trim()) : [],
      source: formData.source,
      author: formData.author,
      difficulty_level: formData.difficulty_level,
      is_published: formData.is_published,
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
          <Label htmlFor="question">Question *</Label>
          <Textarea
            id="question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            required
            rows={3}
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
            placeholder="e.g., what-is-ai or एई-क्या-है"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="gb_category_id">GB Category</Label>
        {isEditMode ? (
          <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
            {selectedCategory?.name || (initialData as any)?.gb_category?.name || categories.find((c) => c._id === formData.gb_category_id)?.name || '-'}
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
        <Label htmlFor="gb_topic_id">GB Topic</Label>
        {isEditMode ? (
          <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
            {selectedTopic?.name || (initialData as any)?.gb_topic?.name || topics.find((t) => t._id === formData.gb_topic_id)?.name || '-'}
          </div>
        ) : (
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
        )}
      </div>

      <div>
        <Label htmlFor="gb_subtopic_id">GB Subtopic *</Label>
        <Select value={formData.gb_subtopic_id} onValueChange={(value) => setFormData({ ...formData, gb_subtopic_id: value })} disabled={!formData.gb_topic_id && !isEditMode} required>
          <SelectTrigger>
            <SelectValue placeholder="Select GB Subtopic" />
          </SelectTrigger>
          <SelectContent>
            {subtopics.map((subtopic) => (
              <SelectItem key={subtopic._id} value={subtopic._id}>
                {subtopic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="answer">Answer</Label>
        <RichTextEditor value={formData.answer} onChange={handleAnswerChange} />
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

      <div className="grid grid-cols-3 gap-4">
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
          <Label htmlFor="difficulty_level">Difficulty Level</Label>
          <Select value={formData.difficulty_level} onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty_level: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
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
        <Label htmlFor="content">Additional Content</Label>
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

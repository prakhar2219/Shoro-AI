import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/rich-text-editor';
import { formatSlug } from '@/lib/utils';

interface ChapterTranslationFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
  languages: Array<{ _id: string; name: string; code: string }>;
}

export function ChapterTranslationForm({ initialData, onSubmit, loading = false, languages }: ChapterTranslationFormProps) {
  const [form, setForm] = useState({
    language_id: initialData?.language_id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    content: typeof initialData?.content === 'string' ? initialData.content : '',
    needs_review: initialData?.needs_review || false,
    translated_by_ai: initialData?.translated_by_ai || false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        language_id: initialData.language_id || '',
        title: initialData.title || '',
        slug: initialData.slug || '',
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || '',
        content: initialData.content || { type: 'doc', content: [] },
        needs_review: initialData.needs_review || false,
        translated_by_ai: initialData.translated_by_ai || false,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Format slug field to replace spaces with hyphens
    if (name === 'slug') {
      const formattedSlug = formatSlug(value);
      setForm((prev) => ({
        ...prev,
        [name]: formattedSlug,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleContentChange = (html: string) => {
    setForm((prev) => ({ ...prev, content: html }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Translation' : 'Add Translation'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language_id">Language</Label>
            <Select
              value={form.language_id}
              onValueChange={(value) => setForm((prev) => ({ ...prev, language_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang._id || lang.code} value={lang._id || lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter translation title"
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
              placeholder="chapter-title-translation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              placeholder="SEO title for this translation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO Description</Label>
            <Input
              id="seo_description"
              name="seo_description"
              value={form.seo_description}
              onChange={handleChange}
              placeholder="SEO description for this translation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={form.content} onChange={handleContentChange} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="needs_review"
                checked={form.needs_review}
                onCheckedChange={(val) => handleSwitchChange('needs_review', val)}
              />
              <Label htmlFor="needs_review">Needs Review</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="translated_by_ai"
                checked={form.translated_by_ai}
                onCheckedChange={(val) => handleSwitchChange('translated_by_ai', val)}
              />
              <Label htmlFor="translated_by_ai">AI</Label>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : initialData ? 'Update Translation' : 'Add Translation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
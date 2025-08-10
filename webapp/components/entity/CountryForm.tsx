// components/entity/CountryForm.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { RichTextEditor } from "@/components/rich-text-editor";

interface CountryFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: {
    name: string;
    code: string;
    default_language_code: string;
    supported_language_codes?: string[];
    content?: any;
  };
  languages: { code: string; name: string }[];
}

export function CountryForm({ onSubmit, loading = false, initialData, languages }: CountryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    default_language_code: initialData?.default_language_code || (languages[0]?.code || ""),
    supported_language_codes: initialData?.supported_language_codes || [],
    content: Array.isArray(initialData?.content) ? initialData.content[0] : initialData?.content || { type: 'doc', content: [] },
  });

  // Local filter state for dropdown and chips
  const [defaultLangFilter, setDefaultLangFilter] = useState("");
  const [supportedLangFilter, setSupportedLangFilter] = useState("");
  const [defaultLangOpen, setDefaultLangOpen] = useState(false);

  // Filtered lists
  const filteredDefaultLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(defaultLangFilter.toLowerCase()) ||
      lang.code.toLowerCase().includes(defaultLangFilter.toLowerCase())
  );
  const filteredSupportedLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(supportedLangFilter.toLowerCase()) ||
      lang.code.toLowerCase().includes(supportedLangFilter.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSupportedLanguagesChange = (value: string) => {
    setFormData((prev) => {
      const exists = prev.supported_language_codes.includes(value);
      return {
        ...prev,
        supported_language_codes: exists
          ? prev.supported_language_codes.filter((c) => c !== value)
          : [...prev.supported_language_codes, value],
      };
    });
  };

  const handleContentChange = (json: any) => {
    setFormData({ ...formData, content: json });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Country" : "Create Country"}</CardTitle>
      </CardHeader>
  <CardContent className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter country name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., IN, US, UK"
              maxLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_language_code">Default Language</Label>
            <div className="relative">
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setDefaultLangOpen((open) => !open)}
                tabIndex={0}
              >
                {languages.find(l => l.code === formData.default_language_code)?.name || "Select default language"}
                <svg className="h-4 w-4 ml-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {defaultLangOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-lg">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Type to filter..."
                      value={defaultLangFilter}
                      onValueChange={setDefaultLangFilter}
                      autoFocus
                    />
                    <CommandList>
                      {filteredDefaultLanguages.length === 0 ? (
                        <CommandEmpty>No languages found.</CommandEmpty>
                      ) : (
                        filteredDefaultLanguages.map((lang) => (
                          <CommandItem
                            key={lang.code}
                            value={lang.code}
                            onSelect={() => {
                              setFormData({ ...formData, default_language_code: lang.code });
                              setDefaultLangOpen(false);
                            }}
                          >
                            {lang.name}
                          </CommandItem>
                        ))
                      )}
                    </CommandList>
                  </Command>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supported Languages</Label>
            <Input
              placeholder="Type to filter..."
              value={supportedLangFilter}
              onChange={e => setSupportedLangFilter(e.target.value)}
              className="mb-2 h-8 text-xs"
            />
            <div className="flex flex-wrap gap-2">
              {filteredSupportedLanguages.length === 0 ? (
                <div className="text-xs text-zinc-500">No languages found.</div>
              ) : (
                filteredSupportedLanguages.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    className={`px-2 py-1 rounded border text-xs ${formData.supported_language_codes.includes(lang.code) ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}
                    onClick={() => handleSupportedLanguagesChange(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor value={formData.content} onChange={handleContentChange} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : initialData ? "Update Country" : "Create Country"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

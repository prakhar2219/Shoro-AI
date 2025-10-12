'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Language {
  _id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  ai_supported: boolean;
}

interface LanguageSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select a language",
  required = false,
  className = ""
}: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/content/languages');
      const data = await response.json();
      
      if (response.ok) {
        setLanguages(data || []);
      } else {
        console.error('Failed to fetch languages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading languages..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language._id} value={language._id}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{language.name}</span>
              <span className="text-sm text-gray-500">({language.native_name})</span>
              <span className="text-xs text-gray-400">{language.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

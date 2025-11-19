import React from 'react';
import { Loader2 } from 'lucide-react';

interface Translation {
  _id?: string;
  id?: string;
  language_id?: string;
  language_code?: string;
  name: string;
  description?: string;
  country_id?: string;
  board_id?: string;
  class_id?: string;
  subject_id?: string;
  chapter_id?: string;
}

// Type guard to check if translation has required fields
export function hasRequiredFields<T extends Translation>(
  translation: T,
  requiredField: keyof T
): translation is T & { [K in typeof requiredField]: string } {
  return typeof translation[requiredField] === 'string' && translation[requiredField] !== '';
}

interface TranslationManagementSectionProps {
  translations: Translation[];
  languageMap: Record<string, string>;
  onAddTranslation: () => void;
  onEditTranslation: (translation: Translation) => void;
  onDeleteTranslation: (translation: Translation) => void;
  activeTranslationAction: string | null;
  isLoading: boolean;
  entityName: string;
}

export function TranslationManagementSection({
  translations,
  languageMap,
  onAddTranslation,
  onEditTranslation,
  onDeleteTranslation,
  activeTranslationAction,
  isLoading,
  entityName
}: TranslationManagementSectionProps) {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-b-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Translations</span>
        <button
          className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex items-center"
          onClick={onAddTranslation}
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 5v10m5-5H5" />
            </svg>
            Add Translation
          </span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border border-zinc-200 dark:border-zinc-700 rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">
                Language
              </th>
              <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">
                Name
              </th>
              <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">
                Description
              </th>
              <th className="px-4 py-2 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-700 text-left bg-zinc-100 dark:bg-zinc-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {translations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-xs text-zinc-500">
                  No translations available.
                </td>
              </tr>
            ) : (
              translations.map((translation) => (
                <tr key={translation._id || translation.id} className="border-b border-zinc-200 dark:border-zinc-700">
                  <td className="px-4 py-2 text-xs">
                    {languageMap[translation.language_id || translation.language_code || ''] || 
                     translation.language_id || translation.language_code || 'Unknown'}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {translation.name}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {translation.description || '-'}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        onClick={() => onEditTranslation(translation)}
                        disabled={isLoading}
                        tabIndex={0}
                        aria-label="Edit Translation"
                      >
                        Edit
                        {activeTranslationAction === (translation._id || translation.id) && isLoading && (
                          <Loader2 className="animate-spin h-3 w-3 ml-1" />
                        )}
                      </button>
                      <button
                        className="text-red-600 hover:underline text-xs flex items-center gap-1"
                        onClick={() => onDeleteTranslation(translation)}
                        disabled={isLoading}
                        tabIndex={0}
                        aria-label="Delete Translation"
                      >
                        Delete
                        {activeTranslationAction === (translation._id || translation.id) && isLoading && (
                          <Loader2 className="animate-spin h-3 w-3 ml-1" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

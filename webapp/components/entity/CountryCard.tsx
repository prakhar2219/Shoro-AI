// components/entity/CountryCard.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Globe } from "lucide-react";

interface Country {
  code: string;
  name: string;
  default_language_code: string;
  supported_language_codes?: string[];
  translations?: Array<{
    _id?: string;
    id?: string;
    language_code: string;
    name: string;
  }>;
}

interface Props {
  country: Country;
  languageMap?: Record<string, string>;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CountryCard({ country, languageMap = {}, onEdit, onDelete }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {country.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{country.code}</Badge>
              <Badge variant="outline">Default: {languageMap[country.default_language_code] || country.default_language_code}</Badge>
            </div>
            {country.supported_language_codes && country.supported_language_codes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs text-zinc-500">Supported:</span>
                {country.supported_language_codes.map((code) => (
                  <Badge key={code} variant="secondary">{languageMap[code] || code}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {country.translations && country.translations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Translations:</h4>
            <div className="flex flex-wrap gap-2">
              {country.translations.map((translation) => (
                <Badge key={translation._id || translation.id} variant="secondary">
                  {languageMap[translation.language_code] || translation.language_code}: {translation.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

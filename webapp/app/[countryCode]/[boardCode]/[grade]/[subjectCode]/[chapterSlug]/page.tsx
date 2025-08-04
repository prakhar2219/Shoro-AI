import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChapterBySlug } from '@/lib/api/entities/chapters';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface ChapterPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { countryCode, boardCode, grade, subjectCode, chapterSlug } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, chapter] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getChapterBySlug(boardCode, gradeNumber, subjectCode, chapterSlug)
    ]);

    if (!country || !board || !chapter) {
      notFound();
    }

    // Find the subject by code from the subjects list
    const subject = subjects.find((s: any) => s.code === subjectCode);
    if (!subject) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href={`/${countryCode}`} className="hover:text-blue-600">{country.name}</Link>
            <span>/</span>
            <Link href={`/${countryCode}/${boardCode}`} className="hover:text-blue-600">{board.name}</Link>
            <span>/</span>
            <Link href={`/${countryCode}/${boardCode}/${gradeNumber}`} className="hover:text-blue-600">Grade {gradeNumber}</Link>
            <span>/</span>
            <Link href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}`} className="hover:text-blue-600">{subject.name}</Link>
            <span>/</span>
            <span>{chapter.title}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
              <p className="text-gray-600">Chapter {chapter.order} • {board.name} Grade {gradeNumber} • {subject.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={chapter.is_published ? "default" : "secondary"}>
                {chapter.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline">v{chapter.version || 1}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {chapter.content && Array.isArray(chapter.content) ? (
                    <div className="space-y-4">
                      {chapter.content.map((contentItem: any, index: number) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          {contentItem.type === 'text' && (
                            <div className="text-gray-800 leading-relaxed">
                              {contentItem.content}
                            </div>
                          )}
                          {contentItem.type === 'heading' && (
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                              {contentItem.content}
                            </h2>
                          )}
                          {contentItem.type === 'list' && (
                            <ul className="list-disc list-inside space-y-1 text-gray-800">
                              {contentItem.content.map((item: string, itemIndex: number) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          )}
                          {contentItem.type === 'image' && (
                            <div className="my-4">
                              <img 
                                src={contentItem.url} 
                                alt={contentItem.alt || 'Chapter image'} 
                                className="max-w-full h-auto rounded-lg"
                              />
                              {contentItem.caption && (
                                <p className="text-sm text-gray-600 mt-2 text-center">{contentItem.caption}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <p>No content available for this chapter.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Chapter Number</p>
                  <p className="text-lg font-semibold">{chapter.order}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Subject</p>
                  <p className="text-lg">{subject.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Board</p>
                  <p className="text-lg">{board.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Grade</p>
                  <p className="text-lg">{gradeNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p className="text-lg">{country.name}</p>
                </div>
                {chapter.seo_title && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">SEO Title</p>
                    <p className="text-sm text-gray-600">{chapter.seo_title}</p>
                  </div>
                )}
                {chapter.seo_description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">SEO Description</p>
                    <p className="text-sm text-gray-600">{chapter.seo_description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(chapter.createdAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(chapter.updatedAt || '').toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
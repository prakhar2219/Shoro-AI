import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChaptersByBoardClassAndSubject } from '@/lib/api/entities/chapters';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface SubjectPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { countryCode, boardCode, grade, subjectCode } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, chapters] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getChaptersByBoardClassAndSubject(boardCode, gradeNumber, subjectCode)
    ]);

    if (!country || !board) {
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
            <span>{subject.name}</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.name}</h1>
              <p className="text-gray-600">{board.name} • Grade {gradeNumber} • Available Chapters</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{chapters.length} Chapters</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter: any) => (
            <Link key={chapter._id} href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapter.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{chapter.title}</span>
                    <Badge variant="secondary">Chapter {chapter.order}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {chapter.seo_description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Order: {chapter.order}</span>
                    <Badge variant={chapter.is_published ? "default" : "secondary"}>
                      {chapter.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No chapters available for this subject.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
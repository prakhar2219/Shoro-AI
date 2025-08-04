import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';

interface ClassPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { countryCode, boardCode, grade } = params;
  
  // Simple grade parsing - just parse the number directly
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, classes] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getClassesByBoardShortCode(boardCode)
    ]);

    if (!country || !board) {
      notFound();
    }

    // Find the specific class for this grade
    const currentClass = classes.find((cls: any) => cls.grade === gradeNumber);

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
            <span>Grade {gradeNumber}</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade {gradeNumber}</h1>
              <p className="text-gray-600">{board.name} • Available Subjects</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{subjects.length} Subjects</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Class Content */}
          {currentClass?.content && currentClass.content.length > 0 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>About Grade {gradeNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <TipTapContentArray content={currentClass.content} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subjects List */}
          <div className={currentClass?.content && currentClass.content.length > 0 ? "lg:col-span-1" : "lg:col-span-4"}>
            <Card>
              <CardHeader>
                <CardTitle>Available Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {subjects.map((subject: any) => (
                    <Link key={subject._id} href={`/${countryCode}/${boardCode}/${gradeNumber}/${subject.code}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span>{subject.name}</span>
                            <Badge variant="secondary">{subject.code}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm mb-2">
                            {subject.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Code: {subject.code}</span>
                            <span>{subject.chapters?.length || 0} Chapters</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {subjects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subjects available for this class.</p>
                  </div>
                )}
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
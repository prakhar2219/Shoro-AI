import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface ClassPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  console.log('Raw params:', params);
  const { countryCode, boardCode, grade } = params;
  
  // Simple grade parsing - just parse the number directly
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber)
    ]);

    if (!country || !board) {
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

        {/* Debug Info - Temporary */}
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="font-bold text-yellow-800">Debug Info:</h3>
          <p>Country Code: {countryCode}</p>
          <p>Board Code: {boardCode}</p>
          <p>Grade Param: {grade} (type: {typeof grade})</p>
          <p>Grade Number: {gradeNumber} (type: {typeof gradeNumber})</p>
          <p>Subjects Count: {subjects?.length || 0}</p>
          <p>Country Name: {country?.name}</p>
          <p>Board Name: {board?.name}</p>
          <p>API Call: getSubjectsByBoardAndClass({boardCode}, {gradeNumber})</p>
          <p>Full params object: {JSON.stringify(params)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject: any) => (
            <Link key={subject._id} href={`/${countryCode}/${boardCode}/${gradeNumber}/${subject.code}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{subject.name}</span>
                    <Badge variant="secondary">{subject.code}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {subject.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Code: {subject.code}</span>
                    <span>{subject.chapters?.length || 0} Chapters</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No subjects available for this class.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
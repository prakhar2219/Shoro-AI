import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface BoardPageProps {
  params: {
    countryCode: string;
    boardCode: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { countryCode, boardCode } = params;

  try {
    const [country, board, classes] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getClassesByBoardShortCode(boardCode)
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
            <span>{board.name}</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.name}</h1>
              <p className="text-gray-600">Available Classes</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{classes.length} Classes</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls: any) => (
            <Link key={cls._id} href={`/${countryCode}/${boardCode}/${cls.grade}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Grade {cls.grade}</span>
                    <Badge variant="secondary">Class {cls.grade}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {cls.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Age: {cls.age_range || 'N/A'}</span>
                    <span>{cls.subjects?.length || 0} Subjects</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No classes available for this board.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
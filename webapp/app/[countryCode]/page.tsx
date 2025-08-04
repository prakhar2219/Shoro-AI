import { getCountry } from '@/lib/api/entities/countries';
import { getBoardsByCountry } from '@/lib/api/entities/boards';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface CountryPageProps {
  params: {
    countryCode: string;
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryCode } = params;

  try {
    const [country, boards] = await Promise.all([
      getCountry(countryCode),
      getBoardsByCountry(countryCode)
    ]);

    if (!country) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span>{country.name}</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{country.name}</h1>
              <p className="text-gray-600">Educational Boards</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{boards.length} Boards</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board: any) => (
            <Link key={board._id} href={`/${countryCode}/${board.short_code}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{board.name}</span>
                    <Badge variant="secondary">{board.short_code}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {board.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Established: {new Date(board.createdAt).getFullYear()}</span>
                    <span>{board.supported_language_ids?.length || 0} Languages</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No boards available for this country.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
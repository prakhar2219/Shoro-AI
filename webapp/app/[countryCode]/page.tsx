import { getCountry } from '@/lib/api/entities/countries';
import { getBoardsByCountry } from '@/lib/api/entities/boards';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Country Content */}
          {country.content && country.content.length > 0 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>About {country.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <TipTapContentArray content={country.content} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Boards List */}
          <div className={country.content && country.content.length > 0 ? "lg:col-span-1" : "lg:col-span-4"}>
            <Card>
              <CardHeader>
                <CardTitle>Educational Boards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {boards.map((board: any) => (
                    <Link key={board._id} href={`/${countryCode}/${board.short_code}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-base">
                            <span>{board.name}</span>
                            <Badge variant="secondary">{board.short_code}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm mb-2">
                            {board.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Established: {new Date(board.createdAt).getFullYear()}</span>
                            <span>{board.supported_language_ids?.length || 0} Languages</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
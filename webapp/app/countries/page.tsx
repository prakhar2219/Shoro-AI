import { getCountries } from '@/lib/api/entities/countries';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span>Countries</span>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Countries</h1>
            <p className="text-gray-600">Explore educational content by country</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{countries.length} Countries</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countries.map((country: any) => (
          <Link key={country._id} href={`/${country.code}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{country.name}</span>
                  <Badge variant="secondary">{country.code}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{country.supported_language_codes?.length || 0} Languages</span>
                  <span>Default: {country.default_language_code}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {countries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No countries available.</p>
        </div>
      )}
    </div>
  );
} 
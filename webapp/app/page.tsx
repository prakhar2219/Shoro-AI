import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCountries } from "@/lib/api/entities/countries"

import Hero from "@/components/custom/Banners/Hero"
import StatsSection from "@/components/custom/HomePage/StatsSection"
import CtaSection from "@/components/custom/common/CtaSection"
import BoardsSection from "@/components/custom/HomePage/BoardSection"
import ClassesSection from "@/components/custom/HomePage/ClassesSection"


export default async function HomePage() {
  // Fetch countries for the homepage
  const countries = await getCountries();

  return (
    <div>
      {/* Hero Section */}
      <Hero isDark={false} />

      {/* Stats Section */}
      <StatsSection />

      {/* Boards Section */}
      <BoardsSection />

      {/* Classes Section */}
      <ClassesSection />

      {/* Countries Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Education by Country</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover educational content organized by countries, boards, classes, and subjects. 
              Navigate through our comprehensive learning resources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {countries.slice(0, 6).map((country: any) => (
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

          {countries.length > 6 && (
            <div className="text-center">
              <Link href="/countries">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  View All Countries
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  )
}

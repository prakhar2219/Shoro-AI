import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Users, Languages } from "lucide-react"
import { getCountries } from "@/lib/api/entities/countries"

export default async function ImprovedCountriesSection() {
  const countries = await getCountries()

  if (!countries || countries.length === 0) {
    return null
  }

  // Take only first 6 countries to keep it simple
  const displayCountries = countries.slice(0, 6)

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Education by Country
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover comprehensive educational content organized by countries, boards, classes, and subjects. 
            Navigate through our extensive learning resources tailored for different educational systems.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {displayCountries.map((country: any) => (
            <Link key={country._id} href={`/${country.code}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {country.flag_url ? (
                        <img
                          src={country.flag_url}
                          alt={`${country.name} flag`}
                          className="w-8 h-8 rounded-md shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-md flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {country.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {country.code.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Languages className="w-4 h-4" />
                        <span>Languages</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {country.supported_language_codes?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Default</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {country.default_language_code?.toUpperCase() || 'EN'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {countries.length > 6 && (
          <div className="text-center">
            <Link href="/countries">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Globe className="w-5 h-5 mr-2" />
                View All Countries
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

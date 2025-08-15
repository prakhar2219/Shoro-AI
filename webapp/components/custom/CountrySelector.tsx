"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCountries } from "@/lib/api/entities/countries"

interface Country {
  _id: string
  name: string
  code: string
  flag_url?: string
}

interface CountrySelectorProps {
  defaultCountry?: string
  className?: string
}

export default function CountrySelector({ defaultCountry = "in", className }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await getCountries()
        setCountries(countriesData || [])
        
        // Find and set default country
        const defaultCountryData = countriesData?.find(c => c.code === defaultCountry)
        if (defaultCountryData) {
          setSelectedCountry(defaultCountryData)
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [defaultCountry])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    router.push(`/${country.code}`)
  }

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        <Globe className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={className}
      >
        <Globe className="w-4 h-4 mr-2" />
        {selectedCountry ? selectedCountry.name : "Select Country"}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 w-64 z-50 shadow-lg">
          <CardContent className="p-2 max-h-64 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country._id}
                onClick={() => handleCountrySelect(country)}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedCountry?._id === country._id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {country.flag_url ? (
                    <img
                      src={country.flag_url}
                      alt={`${country.name} flag`}
                      className="w-5 h-5 rounded-sm"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-center justify-center">
                      <Globe className="w-3 h-3 text-gray-500" />
                    </div>
                  )}
                  <span className="font-medium">{country.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {country.code.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

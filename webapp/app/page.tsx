import Hero from "@/components/custom/Banners/Hero"
import StatsSection from "@/components/custom/HomePage/StatsSection"
import CtaSection from "@/components/custom/common/CtaSection"
import DynamicBoardsSection from "@/components/custom/HomePage/DynamicBoardsSection"
import DynamicSubjectsSection from "@/components/custom/HomePage/DynamicSubjectsSection"
import ImprovedCountriesSection from "@/components/custom/HomePage/ImprovedCountriesSection"

// Force dynamic rendering to avoid build-time API call timeouts
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour (optional)

export default async function HomePage() {
  // Default to India for the homepage
  const defaultCountry = "IN"

  return (
    <div>
      {/* Hero Section */}
      <Hero isDark={false} />

      {/* Stats Section */}
      <StatsSection />

      {/* Dynamic Boards Section - Shows boards from India by default */}
      <DynamicBoardsSection countryCode={defaultCountry} />

      {/* Dynamic Subjects Section - Shows subjects from first board in India */}
      <DynamicSubjectsSection countryCode={defaultCountry} />

      {/* Improved Countries Section */}
      <ImprovedCountriesSection />

      {/* CTA Section */}
      <CtaSection />
    </div>
  )
}

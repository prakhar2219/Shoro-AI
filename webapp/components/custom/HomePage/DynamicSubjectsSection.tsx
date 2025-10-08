import Link from "next/link"
import { BookOpen, Calculator, Atom, Globe, Palette, Music, Heart, Zap } from "lucide-react"
import { getBoardsByCountry } from "@/lib/api/entities/boards"
import { getSubjectsWithPagination } from "@/lib/api/entities/subjects"

interface DynamicSubjectsSectionProps {
  countryCode: string
}

interface Subject {
  _id: string
  name: string
  short_code?: string
  code: string
  class_id: {
    _id: string
    grade: number
  }
}

const SUBJECT_ICONS = {
  mathematics: { icon: Calculator, color: "text-blue-500" },
  science: { icon: Atom, color: "text-green-500" },
  english: { icon: BookOpen, color: "text-purple-500" },
  social: { icon: Globe, color: "text-orange-500" },
  art: { icon: Palette, color: "text-pink-500" },
  music: { icon: Music, color: "text-yellow-500" },
  physical: { icon: Heart, color: "text-red-500" },
  computer: { icon: Zap, color: "text-indigo-500" },
  default: { icon: BookOpen, color: "text-gray-500" }
}

export default async function DynamicSubjectsSection({ countryCode }: DynamicSubjectsSectionProps) {
  try {
    // Get boards for the country
    const boards = await getBoardsByCountry(countryCode)
    
    if (!boards || boards.length === 0) {
      console.log(`No boards found for country: ${countryCode}`)
      return null
    }

    // Get subjects from the first board using paginated API
    const firstBoard = boards[0]
    console.log(`Fetching subjects for board: ${firstBoard.short_code}`)
    
    // Use paginated API with limit 6
    const subjectsResponse = await getSubjectsWithPagination(1, 6, '', undefined)
    const subjects = subjectsResponse?.data || subjectsResponse || []
    
    if (!subjects || subjects.length === 0) {
      console.log(`No subjects found for board: ${firstBoard.short_code}`)
      return null
    }

    console.log(`Found ${subjects.length} subjects`, subjects)
    const displaySubjects: Subject[] = subjects

    return (
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Popular Subjects</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Explore core subjects designed for comprehensive education
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displaySubjects.map((subject) => {
              const subjectName = subject.name?.toLowerCase()
              const iconConfig = SUBJECT_ICONS[subjectName as keyof typeof SUBJECT_ICONS] || SUBJECT_ICONS.default
              const Icon = iconConfig.icon
              
              return (
                <Link 
                  href={`/${countryCode}/${firstBoard?.short_code}/${subject?.class_id?.grade}/${subject?.code}`} 
                  key={subject?._id}
                >
                  <div className="p-6 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 bg-white text-black dark:bg-gray-800 dark:text-white h-full">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <Icon className={`w-12 h-12 ${iconConfig.color}`} />
                      <h3 className="text-base font-semibold">{subject.name}</h3>
                      <span className="bg-sky-100 text-sky-700 text-sm font-medium px-3 py-1.5 rounded-full dark:bg-sky-900 dark:text-sky-300">
                        Secondary
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error("Failed to fetch subjects:", error)
    return (
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Popular Subjects</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Explore core subjects designed for comprehensive education
            </p>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Subjects will be available soon.</p>
          </div>
        </div>
      </section>
    )
  }
}

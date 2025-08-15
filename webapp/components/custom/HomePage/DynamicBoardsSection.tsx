import Link from "next/link"
import { Award, BookOpen, GraduationCap, Target } from "lucide-react"
import BoardCard from "@/components/custom/cards/BoardCard"
import { getBoardsWithPagination } from "@/lib/api/entities/boards"

interface DynamicBoardsSectionProps {
  countryCode: string
}

const BOARD_ICONS = {
  cbse: { icon: BookOpen, color: "text-sky-500" },
  ncert: { icon: GraduationCap, color: "text-emerald-500" },
  icse: { icon: Award, color: "text-violet-500" },
  default: { icon: Target, color: "text-amber-500" }
}

export default async function DynamicBoardsSection({ countryCode }: DynamicBoardsSectionProps) {
  try {
    // Use paginated API with limit 4
    const boardsResponse = await getBoardsWithPagination(1, 4, '', undefined)
    const boards = boardsResponse?.data || boardsResponse || []
    
    if (!boards || boards.length === 0) {
      console.log(`No boards found for country: ${countryCode}`)
      return null
    }

    console.log(`Found ${boards.length} boards`)
    const displayBoards = boards

    return (
      <section className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Popular Boards in {countryCode.toUpperCase()}</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Select from various education boards to access tailored content and curriculum
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {displayBoards.map((board) => {
              const boardCode = board.short_code?.toLowerCase()
              const iconConfig = BOARD_ICONS[boardCode as keyof typeof BOARD_ICONS] || BOARD_ICONS.default
              const Icon = iconConfig.icon
              
              return (
                <Link href={`/${countryCode}/${board.short_code}`} key={board._id} className="block h-full">
                  <BoardCard
                    name={board.name}
                    description={board.description || `${board.name} Board`}
                    students="10M+"
                    icon={<Icon className={`w-10 h-10 ${iconConfig.color}`} />}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error("Failed to fetch boards:", error)
    return (
      <section className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Popular Boards</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Select from various education boards to access tailored content and curriculum
            </p>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Boards will be available soon.</p>
          </div>
        </div>
      </section>
    )
  }
}

import { BookOpen, Users, Award, TrendingUp } from "lucide-react"

const stats = [
    { icon: Users, label: "Students", value: "50M+" },
    { icon: BookOpen, label: "Courses", value: "1000+" },
    { icon: Award, label: "Boards", value: "15+" },
    { icon: TrendingUp, label: "Success Rate", value: "95%" },
]

export default function StatsSection() {
    return (
        <section className="bg-gray-100 dark:bg-gray-900 py-20">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-transform hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 mb-3">
                            <stat.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{stat.value}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

import { ArrowRight } from "lucide-react"

export default function CtaSection() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">Ready to Start Learning?</h3>
                    <p className="text-gray-600 dark:text-gray-300">Join millions of students and access quality educational content</p>
                </div>
                <button className="bg-sky-600 text-white px-6 py-3 rounded-md flex items-center hover:bg-sky-700 transition">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Get Started Today
                </button>
            </div>
        </div>
    )
}

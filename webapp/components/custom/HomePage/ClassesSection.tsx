"use client"

import ClassCard from "@/components/custom/cards/ClassCard"

const CLASSES = [
    { id: 1, name: "Class 1", level: "Primary", subjects: 5 },
    { id: 2, name: "Class 2", level: "Primary", subjects: 5 },
    { id: 3, name: "Class 3", level: "Primary", subjects: 6 },
    { id: 4, name: "Class 4", level: "Primary", subjects: 6 },
    { id: 5, name: "Class 5", level: "Primary", subjects: 7 },
    { id: 6, name: "Class 6", level: "Middle", subjects: 8 },
    { id: 7, name: "Class 7", level: "Middle", subjects: 8 },
    { id: 8, name: "Class 8", level: "Middle", subjects: 9 },
    { id: 9, name: "Class 9", level: "Secondary", subjects: 10 },
    { id: 10, name: "Class 10", level: "Secondary", subjects: 10 },
]

export default function ClassesSection() {

    return (
        <section className="bg-gray-100 dark:bg-gray-900 py-20">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Select Your Class</h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Find content specifically designed for your grade level
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {CLASSES.map((cls) => (
                        <ClassCard
                            key={cls.id}
                            id={cls.id}
                            name={cls.name}
                            level={cls.level}
                            subjects={cls.subjects}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

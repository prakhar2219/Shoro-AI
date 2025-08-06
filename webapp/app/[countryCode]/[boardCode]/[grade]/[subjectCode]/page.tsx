import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChaptersByBoardClassAndSubject } from '@/lib/api/entities/chapters';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { Brain, BookOpen, Calendar, Users, ArrowRight, Building2, GraduationCap, FileText, HelpCircle } from 'lucide-react';

interface SubjectPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { countryCode, boardCode, grade, subjectCode } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, chapters] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getChaptersByBoardClassAndSubject(boardCode, gradeNumber, subjectCode)
    ]);

    if (!country || !board) {
      notFound();
    }

    // Find the subject by code from the subjects list
    const subject = subjects.find((s: any) => s.code === subjectCode);
    if (!subject) {
      notFound();
    }

    return (
      <div className="min-h-screen">
        {/* Hero Section - Matching Home Page Style */}
        <div className="relative overflow-hidden">
          {/* Background Gradient and Effects */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-indigo-200 to-purple-100" />
          
          <div
            className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
            style={{
              background: "radial-gradient(circle at center, #38bdf8, #6366f1)",
            }}
          />
          <div
            className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
            style={{
              background: "radial-gradient(circle at center, #a855f7, #f472b6)",
            }}
          />

          {/* Content */}
          <div className="py-16 md:py-20 px-4 max-w-6xl mx-auto relative z-10">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/${countryCode}`} className="hover:text-blue-600 transition-colors">{country.name}</Link>
              <span>/</span>
              <Link href={`/${countryCode}/${boardCode}`} className="hover:text-blue-600 transition-colors">{board.name}</Link>
              <span>/</span>
              <Link href={`/${countryCode}/${boardCode}/${gradeNumber}`} className="hover:text-blue-600 transition-colors">Grade {gradeNumber}</Link>
              <span>/</span>
              <span className="text-gray-800">{subject.name}</span>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Brain className="h-8 w-8 text-gray-800" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-gray-800 border-white/30">
                  {subject.code}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                {subject.name}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-8">
                {board.name} • Grade {gradeNumber} • Comprehensive learning journey
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{chapters.length} Chapters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Grade {gradeNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {new Date(subject.createdAt || '').getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subject Content */}
              {subject.content && subject.content.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Brain className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">About {subject.name}</CardTitle>
                        <p className="text-gray-600 mt-1">Subject overview and learning objectives</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <TipTapContentArray content={subject.content} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* MCQs Section - Reserved Space */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Brain className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Multiple Choice Questions</CardTitle>
                      <p className="text-gray-600 text-sm">Practice with interactive MCQs</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">MCQ content will be available soon</p>
                    <p className="text-sm text-gray-400 mt-2">Practice questions for better understanding</p>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs Section - Reserved Space */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                      <p className="text-gray-600 text-sm">Common questions and answers</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">FAQ content will be available soon</p>
                    <p className="text-sm text-gray-400 mt-2">Find answers to common questions</p>
                  </div>
                </CardContent>
              </Card>

              {/* Descriptive Questions Section - Reserved Space */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Descriptive Questions</CardTitle>
                      <p className="text-gray-600 text-sm">Detailed answers and explanations</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Descriptive questions will be available soon</p>
                    <p className="text-sm text-gray-400 mt-2">Comprehensive answers with detailed explanations</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chapters List */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Available Chapters</CardTitle>
                      <p className="text-gray-600 text-sm">Explore learning modules</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chapters.map((chapter: any) => (
                      <Link key={chapter._id} href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}/${chapter.slug}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-200 bg-white/60 hover:bg-white rounded-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    Chapter {chapter.order}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {chapter.seo_description || 'Comprehensive learning module with detailed content and exercises'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Order: {chapter.order}</span>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={chapter.is_published ? "default" : "secondary"} className="text-xs">
                                      {chapter.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                      <span>Read</span>
                                      <ArrowRight className="h-3 w-3" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-orange-100 rounded-lg flex items-center justify-center">
                                  <span className="text-pink-600 font-bold text-lg">{chapter.order}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  
                  {chapters.length === 0 && (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No chapters available for this subject.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Visits Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Visits</CardTitle>
                      <p className="text-gray-600 text-sm">Your learning journey</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No recent visits</p>
                    <p className="text-sm text-gray-400 mt-1">Start exploring to see your history</p>
                  </div>
                </CardContent>
              </Card>

              {/* Other Subjects Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Brain className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Other Subjects</CardTitle>
                      <p className="text-gray-600 text-sm">Explore different topics</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">More subjects coming soon</p>
                    <p className="text-sm text-gray-400 mt-1">Explore educational content from other subjects</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
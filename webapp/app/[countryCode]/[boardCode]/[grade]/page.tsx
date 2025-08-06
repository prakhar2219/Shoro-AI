import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { GraduationCap, BookOpen, Calendar, Users, ArrowRight, Building2, Brain, HelpCircle, FileText, Globe } from 'lucide-react';

interface ClassPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { countryCode, boardCode, grade } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, subjects, classes] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getClassesByBoardShortCode(boardCode)
    ]);

    if (!country || !board) {
      notFound();
    }

    const currentClass = classes.find((cls: any) => cls.grade === gradeNumber);

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
              <span className="text-gray-800">Grade {gradeNumber}</span>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <GraduationCap className="h-8 w-8 text-gray-800" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-gray-800 border-white/30">
                  Grade {gradeNumber}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                Grade {gradeNumber}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-8">
                {currentClass?.description || 'Comprehensive learning program designed for this grade level'}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{subjects.length} Subjects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Age: {currentClass?.age_range || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {new Date(currentClass?.createdAt || '').getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Class Content */}
              {currentClass?.content && currentClass.content.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">About Grade {gradeNumber}</CardTitle>
                        <p className="text-gray-600 mt-1">Learning objectives and curriculum overview</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none">
                      <TipTapContentArray content={currentClass.content} />
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
              {/* Subjects List */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Brain className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Available Subjects</CardTitle>
                      <p className="text-gray-600 text-sm">Explore different areas of study</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject: any) => (
                      <Link key={subject._id} href={`/${countryCode}/${boardCode}/${gradeNumber}/${subject.code}`}>
                        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 bg-white/60 hover:bg-white rounded-lg">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {subject.code}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  Comprehensive study of {subject.name.toLowerCase()} concepts and applications
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Core Subject</span>
                                  <div className="flex items-center space-x-1">
                                    <span>Explore</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                {subject.icon ? (
                                  <img 
                                    src={subject.icon} 
                                    alt={`${subject.name} icon`}
                                    className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  
                  {subjects.length === 0 && (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No subjects available for this grade.</p>
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

              {/* Other Classes Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Other Classes</CardTitle>
                      <p className="text-gray-600 text-sm">Explore different grades</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">More classes coming soon</p>
                    <p className="text-sm text-gray-400 mt-1">Explore educational content from other grades</p>
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
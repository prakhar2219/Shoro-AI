import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getChapterBySlug } from '@/lib/api/entities/chapters';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { TipTapContentArray } from '@/components/tiptap-content-array';
import { FileText, BookOpen, Calendar, Users, ArrowLeft, Building2, GraduationCap, Brain, Clock, Eye, HelpCircle } from 'lucide-react';

interface ChapterPageProps {
  params: {
    countryCode: string;
    boardCode: string;
    grade: string;
    subjectCode: string;
    chapterSlug: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { countryCode, boardCode, grade, subjectCode, chapterSlug } = params;
  const gradeNumber = parseInt(grade) || 0;

  try {
    const [country, board, chapter] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getChapterBySlug(boardCode, gradeNumber, subjectCode, chapterSlug)
    ]);

    if (!country || !board || !chapter) {
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
              <Link href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}`} className="hover:text-blue-600 transition-colors">{subjectCode}</Link>
              <span>/</span>
              <span className="text-gray-800">{chapter.title}</span>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="h-8 w-8 text-gray-800" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-gray-800 border-white/30">
                  Chapter {chapter.order}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                {chapter.title}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-8">
                {chapter.seo_description || 'Comprehensive learning module with detailed content and exercises'}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Grade {gradeNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{board.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Version {chapter.version || 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{chapter.is_published ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Chapter Content */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Chapter {chapter.order}: {chapter.title}</CardTitle>
                        <p className="text-gray-600 mt-1">Comprehensive learning content</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={chapter.is_published ? "default" : "secondary"}>
                        {chapter.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">v{chapter.version || 1}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <TipTapContentArray content={chapter.content} />
                  </div>
                </CardContent>
              </Card>

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chapter Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Chapter Info</CardTitle>
                      <p className="text-gray-600 text-sm">Details and metadata</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chapter Number</span>
                    <Badge variant="outline">{chapter.order}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subject</span>
                    <span className="text-sm font-medium">{subjectCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Board</span>
                    <span className="text-sm font-medium">{board.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Grade</span>
                    <span className="text-sm font-medium">{gradeNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Country</span>
                    <span className="text-sm font-medium">{country.name}</span>
                  </div>
                  {chapter.seo_title && (
                    <div className="pt-4 border-t">
                      <span className="text-sm text-gray-600 block mb-2">SEO Title</span>
                      <p className="text-sm text-gray-800">{chapter.seo_title}</p>
                    </div>
                  )}
                  {chapter.seo_description && (
                    <div className="pt-4 border-t">
                      <span className="text-sm text-gray-600 block mb-2">SEO Description</span>
                      <p className="text-sm text-gray-800">{chapter.seo_description}</p>
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

              {/* Other Chapters Section */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Other Chapters</CardTitle>
                      <p className="text-gray-600 text-sm">Explore more content</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">More chapters coming soon</p>
                    <p className="text-sm text-gray-400 mt-1">Explore educational content from other chapters</p>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Footer */}
              <div className="pt-6">
                <Link 
                  href={`/${countryCode}/${boardCode}/${gradeNumber}/${subjectCode}`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors w-full p-4 bg-white/60 rounded-lg hover:bg-white/80"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to {subjectCode}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 
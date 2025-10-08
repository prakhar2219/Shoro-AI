# Chapter Page Components

This directory contains server-rendered, reusable components for displaying chapter-level educational content - the most important level where actual learning content is presented.

## Architecture Overview

The components are designed with the following principles:
- **Server-Side Rendering**: All content is rendered on the server for better SEO and performance
- **No Client State**: Pure UI components with no state management
- **Reusable**: Core components can be used in multiple routes
- **Cached**: Proper caching strategies for optimal performance
- **Content-Focused**: Optimized for displaying rich educational content

## Components

### Core Components

#### `ChapterPageContent`
The main reusable component that renders the complete chapter page. Accepts props for all data and renders the UI without any state management.

**Props:**
- `country`: Country data object
- `board`: Board data object
- `subject`: Subject data object
- `chapter`: Chapter data object with content
- `mcqs`: Array of multiple choice questions
- `faqs`: Array of frequently asked questions
- `descriptiveQuestions`: Array of descriptive questions
- `countryCode`: Country code string
- `boardCode`: Board code string
- `grade`: Grade string
- `subjectCode`: Subject code string
- `chapterSlug`: Chapter slug string

#### `ChapterPageSkeleton`
Loading skeleton for better user experience during data loading.

## Usage Examples

### Basic Usage
```tsx
import { ChapterPageContent } from '@/components/chapter';

export default function MyChapterPage({ data }) {
  return (
    <ChapterPageContent
      country={data.country}
      board={data.board}
      subject={data.subject}
      chapter={data.chapter}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
      subjectCode={data.subjectCode}
      chapterSlug={data.chapterSlug}
    />
  );
}
```

### With Loading State
```tsx
import { ChapterPageContent, ChapterPageSkeleton } from '@/components/chapter';

export default function MyChapterPage({ data, isLoading }) {
  if (isLoading) {
    return <ChapterPageSkeleton />;
  }

  return (
    <ChapterPageContent
      country={data.country}
      board={data.board}
      subject={data.subject}
      chapter={data.chapter}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
      subjectCode={data.subjectCode}
      chapterSlug={data.chapterSlug}
    />
  );
}
```

## Route Examples

### Current Route Structure
```
/[countryCode]/[boardCode]/[grade]/[subjectCode]/[chapterSlug] (e.g., /in/cbse/1/mathematics/chapter-1)
```

### Alternative Route Structure
```
/chapter/[countryCode]/[boardCode]/[grade]/[subjectCode]/[chapterSlug] (e.g., /chapter/in/cbse/1/mathematics/chapter-1)
```

Both routes can use the same `ChapterPageContent` component by passing the appropriate props.

## Caching Strategy

- **Country/Board/Subject/Chapter data**: 1 hour cache (`revalidate: 3600`)
- **MCQ/FAQ/QnA data**: 30 minutes cache (`revalidate: 1800`)
- **Static content**: 24 hours cache (`revalidate: 86400`)
- **User-specific data**: No caching

## Performance Benefits

1. **Server-Side Rendering**: Better SEO and initial page load
2. **No Client State**: Reduced JavaScript bundle size
3. **Proper Caching**: Faster subsequent page loads
4. **Parallel Data Fetching**: All data fetched simultaneously
5. **Static HTML Output**: Minimal client-side processing
6. **Content Optimization**: Rich content rendered on server

## Data Structure

The chapter page displays:
- **Chapter Information**: Title, order, version, publication status
- **Rich Content**: TipTap JSON content rendered as HTML
- **Educational Content**: MCQs, FAQs, and descriptive questions
- **Navigation**: Breadcrumbs and sidebar navigation
- **Metadata**: SEO information and chapter details

## Extending the Components

To add new content types:
1. Create a new server-rendered component
2. Add the data fetching to the service
3. Include the component in `ChapterPageContent`
4. Update the service interface

## Best Practices

1. **Always use server-rendered components** for content sections
2. **Keep components pure** - no state management or side effects
3. **Use proper TypeScript interfaces** for all props
4. **Implement proper error boundaries** in route components
5. **Use loading skeletons** for better UX
6. **Cache data appropriately** based on update frequency
7. **Optimize for content display** - this is the main learning page

## Integration with Other Components

The chapter components reuse the same content section components (`ServerMCQSection`, `ServerFAQSection`, `ServerDescriptiveQuestionSection`) as all other page types, ensuring consistency across the application.

## Data Flow

1. **Route Parameters**: Extract `countryCode`, `boardCode`, `grade`, `subjectCode`, and `chapterSlug`
2. **Data Fetching**: Use `getChapterDataWithCache` to fetch all required data
3. **Validation**: Ensure country, board, subject, and chapter data exist
4. **Rendering**: Pass all data to `ChapterPageContent` component
5. **Error Handling**: Use `notFound()` for missing or invalid data

## URL Structure Examples

- **Current**: `/in/cbse/1/mathematics/chapter-1` → Chapter 1 of Mathematics for Grade 1 of CBSE board in India
- **Alternative**: `/chapter/in/cbse/1/mathematics/chapter-1` → Same content, different URL structure
- **Future**: `/lesson/in/cbse/1/mathematics/chapter-1` → Could be easily added using the same component

## Content Rendering

The chapter page is the primary content display page:
- **TipTap Content**: Rich text content rendered using `ServerTipTapRenderer`
- **Structured Data**: Chapter metadata displayed in sidebar
- **Interactive Elements**: MCQs, FAQs, and descriptive questions
- **SEO Optimization**: Proper meta tags and structured data

## Breadcrumb Navigation

The chapter page maintains the complete navigation hierarchy:
- Home → Country → Board → Grade → Subject → Chapter
- Each level provides proper linking for user navigation
- Breadcrumbs are automatically generated based on the data structure

## Chapter Metadata

The sidebar displays comprehensive chapter information:
- Chapter number and title
- Subject and board information
- Grade level and country
- SEO title and description
- Version and publication status

## Content Sections

1. **Chapter Content**: Rich text content using `ServerTipTapRenderer`
2. **MCQs**: Multiple choice questions for practice
3. **FAQs**: Frequently asked questions and answers
4. **Descriptive Questions**: Detailed questions with explanations

## Performance Considerations

As the chapter page contains the most content:
- **Server-side rendering** ensures fast initial load
- **Proper caching** reduces database queries
- **Parallel data fetching** optimizes load times
- **Static HTML output** minimizes client-side processing
- **Content optimization** for better user experience

## SEO Benefits

The chapter page provides the best SEO opportunities:
- **Rich content** for search engines to index
- **Structured data** for better understanding
- **Proper meta tags** for social sharing
- **Fast loading** for better search rankings
- **Mobile optimization** for mobile-first indexing

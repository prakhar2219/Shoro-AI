# Subject Page Components

This directory contains server-rendered, reusable components for displaying subject-level educational content.

## Architecture Overview

The components are designed with the following principles:
- **Server-Side Rendering**: All content is rendered on the server for better SEO and performance
- **No Client State**: Pure UI components with no state management
- **Reusable**: Core components can be used in multiple routes
- **Cached**: Proper caching strategies for optimal performance

## Components

### Core Components

#### `SubjectPageContent`
The main reusable component that renders the complete subject page. Accepts props for all data and renders the UI without any state management.

**Props:**
- `country`: Country data object
- `board`: Board data object
- `subject`: Subject data object
- `chapters`: Array of available chapters
- `mcqs`: Array of multiple choice questions
- `faqs`: Array of frequently asked questions
- `descriptiveQuestions`: Array of descriptive questions
- `countryCode`: Country code string
- `boardCode`: Board code string
- `grade`: Grade string
- `subjectCode`: Subject code string

#### `SubjectPageSkeleton`
Loading skeleton for better user experience during data loading.

## Usage Examples

### Basic Usage
```tsx
import { SubjectPageContent } from '@/components/subject';

export default function MySubjectPage({ data }) {
  return (
    <SubjectPageContent
      country={data.country}
      board={data.board}
      subject={data.subject}
      chapters={data.chapters}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
      subjectCode={data.subjectCode}
    />
  );
}
```

### With Loading State
```tsx
import { SubjectPageContent, SubjectPageSkeleton } from '@/components/subject';

export default function MySubjectPage({ data, isLoading }) {
  if (isLoading) {
    return <SubjectPageSkeleton />;
  }

  return (
    <SubjectPageContent
      country={data.country}
      board={data.board}
      subject={data.subject}
      chapters={data.chapters}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
      subjectCode={data.subjectCode}
    />
  );
}
```

## Route Examples

### Current Route Structure
```
/[countryCode]/[boardCode]/[grade]/[subjectCode] (e.g., /in/cbse/1/mathematics)
```

### Alternative Route Structure
```
/subject/[countryCode]/[boardCode]/[grade]/[subjectCode] (e.g., /subject/in/cbse/1/mathematics)
```

Both routes can use the same `SubjectPageContent` component by passing the appropriate props.

## Caching Strategy

- **Country/Board/Subject data**: 1 hour cache (`revalidate: 3600`)
- **Chapter data**: 1 hour cache (`revalidate: 3600`)
- **MCQ/FAQ/QnA data**: 30 minutes cache (`revalidate: 1800`)
- **Static content**: 24 hours cache (`revalidate: 86400`)
- **User-specific data**: No caching

## Performance Benefits

1. **Server-Side Rendering**: Better SEO and initial page load
2. **No Client State**: Reduced JavaScript bundle size
3. **Proper Caching**: Faster subsequent page loads
4. **Parallel Data Fetching**: All data fetched simultaneously
5. **Static HTML Output**: Minimal client-side processing

## Data Structure

The subject page displays:
- **Subject Information**: Subject code, description, content
- **Available Chapters**: List of chapters for this subject
- **Educational Content**: MCQs, FAQs, and descriptive questions
- **Navigation**: Breadcrumbs and sidebar navigation

## Extending the Components

To add new content types:
1. Create a new server-rendered component
2. Add the data fetching to the service
3. Include the component in `SubjectPageContent`
4. Update the service interface

## Best Practices

1. **Always use server-rendered components** for content sections
2. **Keep components pure** - no state management or side effects
3. **Use proper TypeScript interfaces** for all props
4. **Implement proper error boundaries** in route components
5. **Use loading skeletons** for better UX
6. **Cache data appropriately** based on update frequency

## Integration with Other Components

The subject components reuse the same content section components (`ServerMCQSection`, `ServerFAQSection`, `ServerDescriptiveQuestionSection`) as the country, board, and grade pages, ensuring consistency across the application.

## Data Flow

1. **Route Parameters**: Extract `countryCode`, `boardCode`, `grade`, and `subjectCode`
2. **Data Fetching**: Use `getSubjectDataWithCache` to fetch all required data
3. **Validation**: Ensure country, board, and subject data exist
4. **Rendering**: Pass all data to `SubjectPageContent` component
5. **Error Handling**: Use `notFound()` for missing or invalid data

## URL Structure Examples

- **Current**: `/in/cbse/1/mathematics` → Mathematics subject for Grade 1 of CBSE board in India
- **Alternative**: `/subject/in/cbse/1/mathematics` → Same content, different URL structure
- **Future**: `/course/in/cbse/1/mathematics` → Could be easily added using the same component

## Chapter Navigation

The subject page provides navigation to individual chapters:
- Each chapter displays with its order number and title
- Chapters link to the next level: `/[countryCode]/[boardCode]/[grade]/[subjectCode]/[chapterSlug]`
- Chapter content includes SEO descriptions and metadata

## Content Sections

1. **Subject Overview**: Rich text content about the subject using `ServerTipTapRenderer`
2. **Chapter List**: Grid display of available chapters with navigation
3. **MCQs**: Multiple choice questions for practice
4. **FAQs**: Frequently asked questions and answers
5. **Descriptive Questions**: Detailed questions with explanations

## Breadcrumb Navigation

The subject page maintains proper navigation hierarchy:
- Home → Country → Board → Grade → Subject
- Each level provides proper linking for user navigation
- Breadcrumbs are automatically generated based on the data structure

# Grade Page Components

This directory contains server-rendered, reusable components for displaying grade-level educational content.

## Architecture Overview

The components are designed with the following principles:
- **Server-Side Rendering**: All content is rendered on the server for better SEO and performance
- **No Client State**: Pure UI components with no state management
- **Reusable**: Core components can be used in multiple routes
- **Cached**: Proper caching strategies for optimal performance

## Components

### Core Components

#### `GradePageContent`
The main reusable component that renders the complete grade page. Accepts props for all data and renders the UI without any state management.

**Props:**
- `country`: Country data object
- `board`: Board data object
- `classData`: Class/grade data object
- `subjects`: Array of available subjects
- `mcqs`: Array of multiple choice questions
- `faqs`: Array of frequently asked questions
- `descriptiveQuestions`: Array of descriptive questions
- `countryCode`: Country code string
- `boardCode`: Board code string
- `grade`: Grade string

#### `GradePageSkeleton`
Loading skeleton for better user experience during data loading.

## Usage Examples

### Basic Usage
```tsx
import { GradePageContent } from '@/components/grade';

export default function MyGradePage({ data }) {
  return (
    <GradePageContent
      country={data.country}
      board={data.board}
      classData={data.classData}
      subjects={data.subjects}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
    />
  );
}
```

### With Loading State
```tsx
import { GradePageContent, GradePageSkeleton } from '@/components/grade';

export default function MyGradePage({ data, isLoading }) {
  if (isLoading) {
    return <GradePageSkeleton />;
  }

  return (
    <GradePageContent
      country={data.country}
      board={data.board}
      classData={data.classData}
      subjects={data.subjects}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
      grade={data.grade}
    />
  );
}
```

## Route Examples

### Current Route Structure
```
/[countryCode]/[boardCode]/[grade] (e.g., /in/cbse/1)
```

### Alternative Route Structure
```
/grade/[countryCode]/[boardCode]/[grade] (e.g., /grade/in/cbse/1)
```

Both routes can use the same `GradePageContent` component by passing the appropriate props.

## Caching Strategy

- **Country/Board/Class data**: 1 hour cache (`revalidate: 3600`)
- **Subject data**: 1 hour cache (`revalidate: 3600`)
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

The grade page displays:
- **Grade Information**: Grade level, description, age range, content
- **Available Subjects**: List of subjects for this grade level
- **Educational Content**: MCQs, FAQs, and descriptive questions
- **Navigation**: Breadcrumbs and sidebar navigation

## Extending the Components

To add new content types:
1. Create a new server-rendered component
2. Add the data fetching to the service
3. Include the component in `GradePageContent`
4. Update the service interface

## Best Practices

1. **Always use server-rendered components** for content sections
2. **Keep components pure** - no state management or side effects
3. **Use proper TypeScript interfaces** for all props
4. **Implement proper error boundaries** in route components
5. **Use loading skeletons** for better UX
6. **Cache data appropriately** based on update frequency

## Integration with Other Components

The grade components reuse the same content section components (`ServerMCQSection`, `ServerFAQSection`, `ServerDescriptiveQuestionSection`) as the country and board pages, ensuring consistency across the application.

## Data Flow

1. **Route Parameters**: Extract `countryCode`, `boardCode`, and `grade`
2. **Data Fetching**: Use `getGradeDataWithCache` to fetch all required data
3. **Validation**: Ensure country, board, and class data exist
4. **Rendering**: Pass all data to `GradePageContent` component
5. **Error Handling**: Use `notFound()` for missing or invalid data

## URL Structure Examples

- **Current**: `/in/cbse/1` → Grade 1 of CBSE board in India
- **Alternative**: `/grade/in/cbse/1` → Same content, different URL structure
- **Future**: `/class/in/cbse/1` → Could be easily added using the same component

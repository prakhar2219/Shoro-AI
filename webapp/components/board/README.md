# Board Page Components

This directory contains server-rendered, reusable components for displaying board educational content.

## Architecture Overview

The components are designed with the following principles:
- **Server-Side Rendering**: All content is rendered on the server for better SEO and performance
- **No Client State**: Pure UI components with no state management
- **Reusable**: Core components can be used in multiple routes
- **Cached**: Proper caching strategies for optimal performance

## Components

### Core Components

#### `BoardPageContent`
The main reusable component that renders the complete board page. Accepts props for all data and renders the UI without any state management.

**Props:**
- `country`: Country data object
- `board`: Board data object
- `classes`: Array of educational classes
- `mcqs`: Array of multiple choice questions
- `faqs`: Array of frequently asked questions
- `descriptiveQuestions`: Array of descriptive questions
- `countryCode`: Country code string
- `boardCode`: Board code string

#### `BoardPageSkeleton`
Loading skeleton for better user experience during data loading.

## Usage Examples

### Basic Usage
```tsx
import { BoardPageContent } from '@/components/board';

export default function MyBoardPage({ data }) {
  return (
    <BoardPageContent
      country={data.country}
      board={data.board}
      classes={data.classes}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
    />
  );
}
```

### With Loading State
```tsx
import { BoardPageContent, BoardPageSkeleton } from '@/components/board';

export default function MyBoardPage({ data, isLoading }) {
  if (isLoading) {
    return <BoardPageSkeleton />;
  }

  return (
    <BoardPageContent
      country={data.country}
      board={data.board}
      classes={data.classes}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
      boardCode={data.boardCode}
    />
  );
}
```

## Route Examples

### Current Route Structure
```
/[countryCode]/[boardCode] (e.g., /in/cbse)
```

### Alternative Route Structure
```
/board/[countryCode]/[boardCode] (e.g., /board/in/cbse)
```

Both routes can use the same `BoardPageContent` component by passing the appropriate props.

## Caching Strategy

- **Country/Board/Class data**: 1 hour cache (`revalidate: 3600`)
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

The board page displays:
- **Board Information**: Name, description, logo, content
- **Available Classes**: Grade levels with descriptions and age ranges
- **Educational Content**: MCQs, FAQs, and descriptive questions
- **Navigation**: Breadcrumbs and sidebar navigation

## Extending the Components

To add new content types:
1. Create a new server-rendered component
2. Add the data fetching to the service
3. Include the component in `BoardPageContent`
4. Update the service interface

## Best Practices

1. **Always use server-rendered components** for content sections
2. **Keep components pure** - no state management or side effects
3. **Use proper TypeScript interfaces** for all props
4. **Implement proper error boundaries** in route components
5. **Use loading skeletons** for better UX
6. **Cache data appropriately** based on update frequency

## Integration with Country Components

The board components reuse the same content section components (`ServerMCQSection`, `ServerFAQSection`, `ServerDescriptiveQuestionSection`) as the country page, ensuring consistency across the application.

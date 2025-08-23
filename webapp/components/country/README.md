# Country Page Components

This directory contains server-rendered, reusable components for displaying country educational content.

## Architecture Overview

The components are designed with the following principles:
- **Server-Side Rendering**: All content is rendered on the server for better SEO and performance
- **No Client State**: Pure UI components with no state management
- **Reusable**: Core components can be used in multiple routes
- **Cached**: Proper caching strategies for optimal performance

## Components

### Core Components

#### `CountryPageContent`
The main reusable component that renders the complete country page. Accepts props for all data and renders the UI without any state management.

**Props:**
- `country`: Country data object
- `boards`: Array of educational boards
- `mcqs`: Array of multiple choice questions
- `faqs`: Array of frequently asked questions
- `descriptiveQuestions`: Array of descriptive questions
- `countryCode`: Country code string

#### `ServerTipTapRenderer`
Server-safe renderer for TipTap JSON content. Converts TipTap JSON to HTML without client-side JavaScript.

**Features:**
- Supports all common TipTap node types
- Handles text formatting (bold, italic, links, etc.)
- Renders tables, lists, images, and more
- No client-side hydration required

#### `ServerMCQSection`
Server-rendered section for multiple choice questions.

#### `ServerFAQSection`
Server-rendered section for frequently asked questions.

#### `ServerDescriptiveQuestionSection`
Server-rendered section for descriptive questions with rich content support.

#### `CountryPageSkeleton`
Loading skeleton for better user experience during data loading.

## Usage Examples

### Basic Usage
```tsx
import { CountryPageContent } from '@/components/country';

export default function MyCountryPage({ data }) {
  return (
    <CountryPageContent
      country={data.country}
      boards={data.boards}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
    />
  );
}
```

### With Loading State
```tsx
import { CountryPageContent, CountryPageSkeleton } from '@/components/country';

export default function MyCountryPage({ data, isLoading }) {
  if (isLoading) {
    return <CountryPageSkeleton />;
  }

  return (
    <CountryPageContent
      country={data.country}
      boards={data.boards}
      mcqs={data.mcqs}
      faqs={data.faqs}
      descriptiveQuestions={data.descriptiveQuestions}
      countryCode={data.countryCode}
    />
  );
}
```

## Route Examples

### Current Route Structure
```
/[countryCode] (e.g., /in)
```

### Alternative Route Structure
```
/country/[countryCode] (e.g., /country/in)
```

Both routes can use the same `CountryPageContent` component by passing the appropriate props.

## Caching Strategy

- **Country/Board data**: 1 hour cache (`revalidate: 3600`)
- **MCQ/FAQ/QnA data**: 30 minutes cache (`revalidate: 1800`)
- **Static content**: 24 hours cache (`revalidate: 86400`)
- **User-specific data**: No caching

## Performance Benefits

1. **Server-Side Rendering**: Better SEO and initial page load
2. **No Client State**: Reduced JavaScript bundle size
3. **Proper Caching**: Faster subsequent page loads
4. **Parallel Data Fetching**: All data fetched simultaneously
5. **Static HTML Output**: Minimal client-side processing

## Extending the Components

To add new content types:
1. Create a new server-rendered component
2. Add the data fetching to the service
3. Include the component in `CountryPageContent`
4. Update the service interface

## Best Practices

1. **Always use server-rendered components** for content sections
2. **Keep components pure** - no state management or side effects
3. **Use proper TypeScript interfaces** for all props
4. **Implement proper error boundaries** in route components
5. **Use loading skeletons** for better UX
6. **Cache data appropriately** based on update frequency

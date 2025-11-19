# TipTap Renderer Components

The TipTap renderer components are designed to render TipTap JSON content as HTML for end-user consumption in dynamic pages.

## Components

### 1. TipTapRenderer
Renders a single TipTap JSON content object.

### 2. TipTapContentArray
Renders multiple TipTap JSON content objects from an array with navigation controls.

## Usage

### Single Content
```tsx
import { TipTapRenderer } from '@/components/tiptap-renderer'

// Basic usage
<TipTapRenderer content={chapter.content[0]} />

// With custom styling
<TipTapRenderer 
  content={chapter.content[0]} 
  className="custom-styles" 
  showEmptyState={false} 
/>
```

### Array Content
```tsx
import { TipTapContentArray } from '@/components/tiptap-content-array'

// With navigation controls
<TipTapContentArray content={chapter.content} />

// Without navigation controls
<TipTapContentArray content={chapter.content} showNavigation={false} />
```

## Props

### TipTapRenderer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `JSONContent \| null \| undefined \| any[] \| any` | - | The TipTap JSON content to render |
| `className` | `string` | - | Additional CSS classes |
| `showEmptyState` | `boolean` | `true` | Whether to show a message when content is empty |
| `contentIndex` | `number` | `0` | For array content, specify which index to render |

### TipTapContentArray Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `any[] \| null \| undefined` | - | Array of TipTap JSON content objects |
| `className` | `string` | - | Additional CSS classes |
| `showNavigation` | `boolean` | `true` | Whether to show navigation controls |
| `showEmptyState` | `boolean` | `true` | Whether to show a message when content is empty |

## Features

- **Rich Content Support**: Renders headings, paragraphs, lists, tables, links, and formatted text
- **Array Content Support**: Handles content stored as arrays with navigation
- **Multiple Format Support**: Handles TipTap JSON, arrays, strings, and legacy content formats
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Uses Tailwind CSS classes for consistent appearance
- **Error Handling**: Gracefully handles empty or invalid content
- **Read-only**: Designed for content display, not editing

## Supported Content Types

- **Headings**: H1, H2, H3, etc.
- **Paragraphs**: Regular text content
- **Lists**: Bullet lists and numbered lists
- **Tables**: Full table support with headers and cells
- **Links**: External and internal links
- **Formatting**: Bold, italic, underline, strikethrough
- **Code**: Inline code and code blocks
- **Blockquotes**: Quoted content with styling

## Content Format Support

The components can handle various content formats:

### 1. Array Format (Most Common)
```javascript
[
  { type: 'doc', content: [...] }, // First content section
  { type: 'doc', content: [...] }, // Second content section
  // ... more content sections
]
```

### 2. Single TipTap JSON Format
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Chapter Title" }]
    }
  ]
}
```

## Integration with Dynamic Pages

The components are designed to work seamlessly with your dynamic pages:

```tsx
// In chapter page - using array content
<CardContent>
  <div className="prose max-w-none">
    <TipTapContentArray content={chapter.content} />
  </div>
</CardContent>

// Or for single content
<CardContent>
  <div className="prose max-w-none">
    <TipTapRenderer content={chapter.content[0]} />
  </div>
</CardContent>
```

## Styling

The components include comprehensive styling for all content types. You can override styles by:

1. Adding custom classes via the `className` prop
2. Modifying the CSS in `globals.css` under the `.tiptap-renderer` section
3. Using Tailwind's `@apply` directive for custom styles

## Demo

Visit `/tiptap-demo` to see both components in action with sample content.

## Navigation Features

The `TipTapContentArray` component includes:

- **Previous/Next Buttons**: Navigate between content sections
- **Progress Indicator**: Shows current position (e.g., "2 of 5")
- **Dot Navigation**: Click dots to jump to specific sections
- **Auto-hide**: Navigation only shows when there are multiple content sections 
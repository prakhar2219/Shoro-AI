"use client"

import { TipTapRenderer } from "@/components/tiptap-renderer"
import { TipTapContentArray } from "@/components/tiptap-content-array"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sample TipTap JSON content for demonstration
const SAMPLE_CONTENT = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to Mathematics" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a " },
        { type: "text", marks: [{ type: "bold" }], text: "sample chapter" },
        { type: "text", text: " that demonstrates how the TipTap renderer works." }
      ]
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Key Concepts" }]
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Addition and subtraction" }] }]
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Multiplication and division" }] }]
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Fractions and decimals" }] }]
        }
      ]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "You can also include " },
        { type: "text", marks: [{ type: "link", attrs: { href: "https://example.com" } }], text: "links" },
        { type: "text", text: " and " },
        { type: "text", marks: [{ type: "italic" }], text: "formatted text" },
        { type: "text", text: " in your content." }
      ]
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Operation" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Symbol" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Example" }] }] }
          ]
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Addition" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "+" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "2 + 3 = 5" }] }] }
          ]
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Multiplication" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "×" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "4 × 5 = 20" }] }] }
          ]
        }
      ]
    }
  ]
}

// Sample array content (like what's stored in the database)
const SAMPLE_ARRAY_CONTENT = [
  SAMPLE_CONTENT,
  {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Second Content Section" }]
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is the " },
          { type: "text", marks: [{ type: "bold" }], text: "second item" },
          { type: "text", text: " in the content array." }
        ]
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "You can navigate between multiple content sections using the navigation controls." }
        ]
      }
    ]
  },
  {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Third Content Section" }]
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is the " },
          { type: "text", marks: [{ type: "italic" }], text: "third and final" },
          { type: "text", text: " content section." }
        ]
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Multiple content sections" }] }]
          },
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Navigation between sections" }] }]
          },
          {
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: "Rich formatting support" }] }]
          }
        ]
      }
    ]
  }
]

export default function TipTapDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TipTap Renderer Demo</h1>
        <p className="text-gray-600">This page demonstrates how the TipTap renderer components display rich content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Single Content */}
        <Card>
          <CardHeader>
            <CardTitle>Single Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TipTapRenderer content={SAMPLE_CONTENT} />
          </CardContent>
        </Card>

        {/* Array Content with Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Array Content (with Navigation)</CardTitle>
          </CardHeader>
          <CardContent>
            <TipTapContentArray content={SAMPLE_ARRAY_CONTENT} />
          </CardContent>
        </Card>

        {/* Empty Content */}
        <Card>
          <CardHeader>
            <CardTitle>Empty Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TipTapRenderer content={null} />
          </CardContent>
        </Card>

        {/* Array Content without Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Array Content (no Navigation)</CardTitle>
          </CardHeader>
          <CardContent>
            <TipTapContentArray content={SAMPLE_ARRAY_CONTENT} showNavigation={false} />
          </CardContent>
        </Card>
      </div>

      {/* Raw JSON */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Raw JSON Content Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Single Content JSON:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-40">
                {JSON.stringify(SAMPLE_CONTENT, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Array Content Structure:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-40">
                {JSON.stringify(SAMPLE_ARRAY_CONTENT, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
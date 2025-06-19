"use client"

import { useState } from "react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  const [htmlContent, setHtmlContent] = useState("")

  return (
    <div className=" py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tiptap Rich Text Editor</h1>
        <p className="text-muted-foreground">A powerful rich text editor with tables, custom links, and HTML output</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
            <CardDescription>Create rich content with tables, links, and formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor content="" onChange={(html) => setHtmlContent(html)} className="min-h-[400px]" />
          </CardContent>
        </Card>

        {/* HTML Output */}
        <Card>
          <CardHeader>
            <CardTitle>HTML Output</CardTitle>
            <CardDescription>The generated HTML ready for database storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Preview */}
              <div>
                <h4 className="text-sm font-medium mb-2">Preview:</h4>
                <div
                  className="prose prose-sm max-w-none border rounded-md p-4 min-h-[200px] bg-muted/30"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>

              <Separator />

              {/* Raw HTML */}
              <div>
                <h4 className="text-sm font-medium mb-2">Raw HTML:</h4>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[200px] whitespace-pre-wrap">
                  {htmlContent || "Start typing to see HTML output..."}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

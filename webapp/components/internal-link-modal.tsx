"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InternalLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onAddLink: (url: string, text: string) => void
}

// Mock internal pages - replace with your actual pages/routes
const INTERNAL_PAGES = [
  { id: "home", title: "Home Page", url: "/" },
  { id: "about", title: "About Us", url: "/about" },
  { id: "services", title: "Our Services", url: "/services" },
  { id: "contact", title: "Contact", url: "/contact" },
  { id: "blog", title: "Blog", url: "/blog" },
  { id: "pricing", title: "Pricing", url: "/pricing" },
]

export function InternalLinkModal({ isOpen, onClose, onAddLink }: InternalLinkModalProps) {
  const [selectedPage, setSelectedPage] = useState("")
  const [linkText, setLinkText] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [linkType, setLinkType] = useState<"page" | "custom">("page")

  const handleSubmit = () => {
    let url = ""
    let text = linkText

    if (linkType === "page" && selectedPage) {
      const page = INTERNAL_PAGES.find((p) => p.id === selectedPage)
      if (page) {
        url = page.url
        if (!text) text = page.title
      }
    } else if (linkType === "custom" && customUrl) {
      url = customUrl
    }

    if (url && text) {
      onAddLink(url, text)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedPage("")
    setLinkText("")
    setCustomUrl("")
    setLinkType("page")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Internal Link</DialogTitle>
          <DialogDescription>Create a link to another page within your site.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="link-type">Link Type</Label>
            <Select value={linkType} onValueChange={(value: "page" | "custom") => setLinkType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Predefined Page</SelectItem>
                <SelectItem value="custom">Custom URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {linkType === "page" ? (
            <div className="grid gap-2">
              <Label htmlFor="page-select">Select Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a page" />
                </SelectTrigger>
                <SelectContent>
                  {INTERNAL_PAGES.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title} ({page.url})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="custom-url">Custom URL</Label>
              <Input
                id="custom-url"
                placeholder="/custom-page"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="link-text">Link Text</Label>
            <Input
              id="link-text"
              placeholder="Enter link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            {linkType === "page" && selectedPage && !linkText && (
              <p className="text-sm text-muted-foreground">
                Will use page title: "{INTERNAL_PAGES.find((p) => p.id === selectedPage)?.title}"
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(linkType === "page" && !selectedPage) || (linkType === "custom" && !customUrl)}
          >
            Add Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

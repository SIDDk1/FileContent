"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Eye, Download } from "lucide-react"
import type { DocumentLayout, SearchMatch } from "@/lib/document-parser"

interface DocumentViewerProps {
  documentLayout: DocumentLayout | null
  currentMatch: SearchMatch | null
  fileName: string
}

export default function DocumentViewer({ documentLayout, currentMatch, fileName }: DocumentViewerProps) {
  const [highlightedText, setHighlightedText] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const matchRefs = useRef<Map<number, HTMLElement>>(new Map())

  useEffect(() => {
    if (documentLayout) {
      setHighlightedText(documentLayout.text)
    }
  }, [documentLayout])

  useEffect(() => {
    if (currentMatch && documentLayout) {
      // Highlight the current match in the text
      const text = documentLayout.text
      const beforeMatch = text.substring(0, currentMatch.startIndex)
      const matchText = text.substring(currentMatch.startIndex, currentMatch.endIndex)
      const afterMatch = text.substring(currentMatch.endIndex)

      const highlighted =
        beforeMatch +
        `<mark class="bg-yellow-300 dark:bg-yellow-700 px-1 rounded font-medium" data-match-id="${currentMatch.startIndex}">` +
        matchText +
        "</mark>" +
        afterMatch

      setHighlightedText(highlighted)

      // Scroll to the match
      setTimeout(() => {
        const matchElement = document.querySelector(`[data-match-id="${currentMatch.startIndex}"]`)
        if (matchElement) {
          matchElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      }, 100)
    }
  }, [currentMatch, documentLayout])

  const formatTextWithLineNumbers = (text: string) => {
    const lines = text.split("\n")
    return lines.map((line, index) => (
      <div key={index} className="flex">
        <span className="text-xs text-muted-foreground w-12 flex-shrink-0 text-right pr-2 select-none">
          {index + 1}
        </span>
        <span
          className="flex-1 whitespace-pre-wrap font-mono text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
        />
      </div>
    ))
  }

  const exportDocument = () => {
    if (!documentLayout) return

    const blob = new Blob([documentLayout.text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}_exported`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!documentLayout) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No document loaded</p>
            <p className="text-sm">Upload a document to view its content</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Viewer
          </CardTitle>

          {/* Removed Export Button */}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{fileName}</span>
          {/* Removed pages, words, and section badges as per request */}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96 w-full border rounded-md">
          <div ref={scrollAreaRef} className="p-4">
            {formatTextWithLineNumbers(highlightedText)}
          </div>
        </ScrollArea>

        {/* Page Navigation */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total Characters: {documentLayout.characterCount.toLocaleString()}</span>
            {/* Removed Sections count as per request */}
          </div>

          {currentMatch && (
            <div className="flex items-center gap-2">
              <span>Current match at position {currentMatch.startIndex.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Removed Section Overview as per request */}
      </CardContent>
    </Card>
  )
}

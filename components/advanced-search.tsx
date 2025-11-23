"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Settings, ChevronDown, ChevronUp, FileText, MapPin, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DocumentParser, type DocumentLayout, type SearchMatch, type SearchOptions } from "@/lib/document-parser"

interface AdvancedSearchProps {
  documentLayout: DocumentLayout | null
  onMatchSelect: (match: SearchMatch) => void
}

export default function AdvancedSearch({ documentLayout, onMatchSelect }: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<SearchMatch[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    matchCase: false,
    wholeWord: false,
    useWildcards: false,
    useRegex: false,
    searchBackwards: false,
  })

  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!documentLayout || !query.trim()) {
      setMatches([])
      setCurrentMatchIndex(-1)
      return
    }

    setIsSearching(true)

    try {
      const results = DocumentParser.searchDocument(documentLayout, query, searchOptions)
      setMatches(results)
      setCurrentMatchIndex(results.length > 0 ? 0 : -1)

      if (results.length > 0) {
        onMatchSelect(results[0])
      }
    } catch (error) {
      console.error("Search error:", error)
      setMatches([])
      setCurrentMatchIndex(-1)
    } finally {
      setIsSearching(false)
    }
  }

  const navigateToMatch = (index: number) => {
    if (index >= 0 && index < matches.length) {
      setCurrentMatchIndex(index)
      onMatchSelect(matches[index])
    }
  }

  const nextMatch = () => {
    const nextIndex = currentMatchIndex < matches.length - 1 ? currentMatchIndex + 1 : 0
    navigateToMatch(nextIndex)
  }

  const previousMatch = () => {
    const prevIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : matches.length - 1
    navigateToMatch(prevIndex)
  }

  const highlightMatch = (context: string, matchText: string, beforeContext: string, afterContext: string) => {
    const beforeHighlight = beforeContext.slice(-50) // Last 50 chars of before context
    const afterHighlight = afterContext.slice(0, 50) // First 50 chars of after context

    return (
      <span className="text-sm">
        <span className="text-muted-foreground">{beforeHighlight}</span>
        <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-medium">{matchText}</mark>
        <span className="text-muted-foreground">{afterHighlight}</span>
      </span>
    )
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "f") {
          e.preventDefault()
          searchInputRef.current?.focus()
        } else if (e.key === "g") {
          e.preventDefault()
          if (e.shiftKey) {
            previousMatch()
          } else {
            nextMatch()
          }
        }
      } else if (e.key === "F3") {
        e.preventDefault()
        if (e.shiftKey) {
          previousMatch()
        } else {
          nextMatch()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentMatchIndex, matches.length])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Document Search
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={searchInputRef}
              placeholder="Search document... (Ctrl+F)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pr-20"
            />
            {matches.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                {currentMatchIndex + 1} of {matches.length}
              </div>
            )}
          </div>

          <Button onClick={handleSearch} disabled={isSearching || !documentLayout}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Navigation Controls */}
        {matches.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMatch} disabled={matches.length === 0}>
              <ChevronUp className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={nextMatch} disabled={matches.length === 0}>
              <ChevronDown className="h-4 w-4" />
            </Button>

            <Badge variant="secondary" className="ml-2">
              {matches.length} match{matches.length !== 1 ? "es" : ""} found
            </Badge>
          </div>
        )}

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Options
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matchCase"
                  checked={searchOptions.matchCase}
                  onCheckedChange={(checked) => setSearchOptions((prev) => ({ ...prev, matchCase: !!checked }))}
                />
                <Label htmlFor="matchCase" className="text-sm">
                  Match case
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wholeWord"
                  checked={searchOptions.wholeWord}
                  onCheckedChange={(checked) => setSearchOptions((prev) => ({ ...prev, wholeWord: !!checked }))}
                />
                <Label htmlFor="wholeWord" className="text-sm">
                  Whole word
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useWildcards"
                  checked={searchOptions.useWildcards}
                  onCheckedChange={(checked) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      useWildcards: !!checked,
                      useRegex: checked ? false : prev.useRegex,
                    }))
                  }
                />
                <Label htmlFor="useWildcards" className="text-sm">
                  Wildcards (* ?)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRegex"
                  checked={searchOptions.useRegex}
                  onCheckedChange={(checked) =>
                    setSearchOptions((prev) => ({
                      ...prev,
                      useRegex: !!checked,
                      useWildcards: checked ? false : prev.useWildcards,
                    }))
                  }
                />
                <Label htmlFor="useRegex" className="text-sm">
                  Regular expressions
                </Label>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Wildcards:</strong> Use * for any characters, ? for single character
              </p>
              <p>
                <strong>Regex:</strong> Use regular expression patterns
              </p>
              <p>
                <strong>Shortcuts:</strong> Ctrl+F (focus), F3/Ctrl+G (next), Shift+F3/Ctrl+Shift+G (previous)
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Search Results */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <h4 className="font-medium text-sm">Search Results</h4>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      index === currentMatchIndex ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => navigateToMatch(index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>Page {match.pageNumber}</span>

                          {match.lineNumber && (
                            <>
                              <span>•</span>
                              <Hash className="h-3 w-3" />
                              <span>Line {match.lineNumber}</span>
                            </>
                          )}

                          {match.sectionTitle && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-32">{match.sectionTitle}</span>
                            </>
                          )}
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>

                      <div className="text-sm">
                        {highlightMatch(match.context, match.text, match.beforeContext, match.afterContext)}
                      </div>

                      {match.sectionTitle && (
                        <div className="mt-2 text-xs text-muted-foreground">Section: {match.sectionTitle}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Document Info */}
        {documentLayout && (
          <div className="text-xs text-muted-foreground space-y-1">
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <span>Pages: {documentLayout.totalPages}</span>
              <span>Words: {documentLayout.wordCount.toLocaleString()}</span>
              <span>Characters: {documentLayout.characterCount.toLocaleString()}</span>
              <span>Sections: {documentLayout.sections.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Search, FileText, Code, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MultiFileSearch from "@/components/multi-file-search"
import WordDocumentSearch from "@/components/word-document-search"
import PPTXXLSXSearch from "@/components/pptx-xlsx-search";
import dynamic from "next/dynamic";
const PdfSearch = dynamic(() => import("@/components/pdf-search"), { ssr: false });

export default function FileSearchTool() {
  const [selectedTool, setSelectedTool] = useState<"multi" | "word" | "pptx" | "pdf" | null>(null)

  if (selectedTool === "multi") {
    return <MultiFileSearch onBack={() => setSelectedTool(null)} />
  }

  if (selectedTool === "word") {
    return <WordDocumentSearch onBack={() => setSelectedTool(null)} />
  }

  if (selectedTool === "pptx") {
    return <PPTXXLSXSearch onBack={() => setSelectedTool(null)} />
  }

  if (selectedTool === "pdf") {
    return <PdfSearch onBack={() => setSelectedTool(null)} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Content-Based File Search Tools</h1>
          <p className="text-muted-foreground text-lg">Choose the right search tool for your needs</p>
        </div>

        {/* Horizontal layout for all four search sections */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch w-full">
          {/* Multi-File Search Tool */}
          <div className="flex-1 min-w-[260px] max-w-xs flex flex-col">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex-1 flex flex-col" onClick={() => setSelectedTool("multi")}> 
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Multi-File Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-muted-foreground mb-3">
                    Search across multiple programming and text files in your project directories.
                  </p>
                  <h4 className="font-medium mb-2">Supported File Types:</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[{ name: "Python", color: "bg-green-100 text-green-800" }, { name: "Java", color: "bg-red-100 text-red-800" }, { name: "JavaScript", color: "bg-yellow-100 text-yellow-800" }, { name: "TypeScript", color: "bg-blue-100 text-blue-800" }, { name: "HTML", color: "bg-orange-100 text-orange-800" }, { name: "JSON", color: "bg-purple-100 text-purple-800" }, { name: "Text", color: "bg-gray-100 text-gray-800" }, { name: "CSV", color: "bg-teal-100 text-teal-800" }].map((type) => (
                      <Badge key={type.name} className={type.color} variant="secondary">
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Search across entire project directories</li>
                    <li>• Line number detection</li>
                    <li>• Case sensitive options</li>
                    <li>• File type filtering</li>
                    <li>• Fast bulk search</li>
                  </ul>
                </div>
                <Button className="w-full mt-4" onClick={e => { e.stopPropagation(); setSelectedTool("multi") }}> 
                  <Code className="h-4 w-4 mr-2" />
                  Use Multi-File Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Word Document Search Tool */}
          <div className="flex-1 min-w-[260px] max-w-xs flex flex-col">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex-1 flex flex-col" onClick={() => setSelectedTool("word")}> 
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  Word Document Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-muted-foreground mb-3">
                    Advanced Microsoft Word-like search with accurate page detection and document structure analysis.
                  </p>
                  <h4 className="font-medium mb-2">Supported Formats:</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[{ name: ".docx", color: "bg-blue-100 text-blue-800" }, { name: ".doc", color: "bg-blue-200 text-blue-900" }, { name: "", color: "bg-gray-100 text-gray-800" }].map((type) => (
                      <Badge key={type.name} className={type.color} variant="secondary">
                        {type.name}
                      </Badge>
                    ))}
                  </div>
                  <h4 className="font-medium mb-2">Advanced Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Accurate page number detection</li>
                    <li>• Section and heading recognition</li>
                    <li>• Context snippets with highlighting</li>
                    <li>• Wildcards and regex support</li>
                    <li>• Document structure analysis</li>
                    <li>• Word-like search experience</li>
                  </ul>
                </div>
                <Button className="w-full mt-4" onClick={e => { e.stopPropagation(); setSelectedTool("word") }}> 
                  <FileText className="h-4 w-4 mr-2" />
                  Use Word Document Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PPTX & XLSX Search Tool */}
          <div className="flex-1 min-w-[260px] max-w-xs flex flex-col">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <span role="img" aria-label="pptx-xlsx" className="text-purple-600 dark:text-purple-400 text-2xl">📊</span>
                  </div>
                  PPTX & XLSX Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-muted-foreground mb-3">
                    Search inside Microsoft PowerPoint and Excel files. Upload a folder of .pptx or .xlsx files and find content instantly. You can also ask questions in the AI tab.
                  </p>
                  <h4 className="font-medium mb-2">Supported Formats:</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className="bg-purple-100 text-purple-800" variant="secondary">.pptx</Badge>
                    <Badge className="bg-green-100 text-green-800" variant="secondary">.xlsx</Badge>
                  </div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Search inside individual slides and sheets</li>
                    <li>Upload and index entire folders</li>
                    <li>Extract and search text from charts and tables</li>
                    <li>Context snippets for matches</li>
                    <li>Fast, simple keyword search</li>
                  </ul>
                </div>
                <Button className="w-full mt-4" onClick={e => { e.stopPropagation(); setSelectedTool("pptx") }}> 
                  <span className="mr-2">📊</span>
                  Use PPTX & XLSX Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* PDF Search Tool */}
          <div className="flex-1 min-w-[260px] max-w-xs flex flex-col">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <span role="img" aria-label="pdf" className="text-red-600 dark:text-red-400 text-2xl">📄</span>
                  </div>
                  PDF Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-muted-foreground mb-3">
                    Upload PDF files or folders and search their content instantly.
                  </p>
                  <h4 className="font-medium mb-2">Supported Formats:</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className="bg-red-100 text-red-800" variant="secondary">.pdf</Badge>
                  </div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>OCR support for scanned PDFs</li>
                    <li>Accurate text and table extraction</li>
                    <li>Search document metadata</li>
                    <li>Analyze table of contents structure</li>
                    <li>Semantic search capabilities</li>
                  </ul>
                </div>
                <Button className="w-full mt-4" onClick={e => { e.stopPropagation(); setSelectedTool("pdf") }}> 
                  <span className="mr-2">📄</span>
                  Use PDF Search
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Each tool is optimized for its specific use case to provide the most accurate results
          </p>
        </div>
      </div>
    </div>
  )
}

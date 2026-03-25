import mammoth from "mammoth"
import Tesseract from "tesseract.js"
import JSZip from "jszip"

export interface WordParseResult {
  text: string
  pages: Array<{
    pageNumber: number
    content: string
    startIndex: number
    endIndex: number
  }>
  isDocFile?: boolean
}

export interface DocumentSection {
  level: number
  title: string
  startIndex: number
  endIndex: number
}

export interface DocumentPage {
  pageNumber: number
  content: string
  startIndex: number
  endIndex: number
  sections: DocumentSection[]
  lineCount: number
}

export interface AdvancedSearchMatch {
  text: string
  startIndex: number
  endIndex: number
  pageNumber: number
  lineNumber: number
  sectionTitle?: string
  context: string
  beforeContext: string
  afterContext: string
}

export interface DocumentLayout {
  text: string
  pages: DocumentPage[]
  sections: DocumentSection[]
  totalPages: number
  wordCount: number
  characterCount: number
}

export interface AdvancedSearchOptions {
  matchCase: boolean
  wholeWord: boolean
  useWildcards: boolean
  useRegex: boolean
  searchBackwards: boolean
}

export class AdvancedDocumentParser {
  private static readonly CHARS_PER_LINE = 80
  private static readonly LINES_PER_PAGE = 50
  private static readonly CHARS_PER_PAGE = AdvancedDocumentParser.CHARS_PER_LINE * AdvancedDocumentParser.LINES_PER_PAGE

  static async parseDocumentAdvanced(file: File): Promise<DocumentLayout> {
    const fileName = file.name.toLowerCase()
    let text = ""
    let htmlContent = ""

    if (fileName.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer()
      const textResult = await mammoth.extractRawText({ arrayBuffer })
      text = textResult.value

      try {
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
        htmlContent = htmlResult.value
      } catch (e) {
        console.log("Could not extract HTML from docx")
      }
    } else if (fileName.endsWith(".doc")) {
      text = await this.extractDocTextAdvanced(file)
    } else {
      text = await this.readTextFileAdvanced(file)
    }

    text = this.normalizeText(text)
    const sections = this.detectSections(text, htmlContent)
    const pages = this.simulatePageLayout(text, sections)

    return {
      text,
      pages,
      sections,
      totalPages: pages.length,
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      characterCount: text.length,
    }
  }

  private static async extractDocTextAdvanced(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()

    try {
      const result = await mammoth.extractRawText({ arrayBuffer })
      if (result.value && result.value.trim().length > 0) {
        return result.value
      }
    } catch (e) {
      console.log("Mammoth failed for .doc file")
    }

    const uint8Array = new Uint8Array(arrayBuffer)
    let extractedText = ""

    for (let i = 0; i < uint8Array.length; i++) {
      const char = uint8Array[i]
      if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
        extractedText += String.fromCharCode(char)
      } else if (char === 12) {
        extractedText += "\f"
      }
    }

    return this.normalizeText(extractedText)
  }

  private static async readTextFileAdvanced(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve((e.target?.result as string) || "")
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  private static normalizeText(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\t/g, "    ").trim()
  }

  private static detectSections(text: string, htmlContent?: string): DocumentSection[] {
    const sections: DocumentSection[] = []
    const lines = text.split("\n")

    if (htmlContent) {
      const headingMatches = htmlContent.matchAll(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi)
      for (const match of headingMatches) {
        const level = Number.parseInt(match[1])
        const title = match[2].replace(/<[^>]*>/g, "").trim()
        const textIndex = text.toLowerCase().indexOf(title.toLowerCase())
        if (textIndex !== -1) {
          sections.push({
            level,
            title,
            startIndex: textIndex,
            endIndex: textIndex + title.length,
          })
        }
      }
    }

    const headingPatterns = [
      /^(Chapter|Section|Part)\s+\d+[:\-\s](.+)$/i,
      /^(\d+\.?\d*\.?\d*)\s+(.+)$/,
      /^([A-Z][A-Z\s]{2,})$/,
      /^(.{1,50})\s*\n\s*[=-]{3,}\s*$/m,
    ]

    let currentIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineStart = currentIndex
      currentIndex += lines[i].length + 1

      if (line.length === 0) continue

      for (const pattern of headingPatterns) {
        const match = line.match(pattern)
        if (match) {
          const title = match[2] || match[1] || line
          const level = this.determineHeadingLevel(line, match)

          sections.push({
            level,
            title: title.trim(),
            startIndex: lineStart,
            endIndex: lineStart + line.length,
          })
          break
        }
      }
    }

    return sections.sort((a, b) => a.startIndex - b.startIndex)
  }

  private static determineHeadingLevel(line: string, match: RegExpMatchArray): number {
    if (match[1] && /^\d+\./.test(match[1])) {
      const dots = (match[1].match(/\./g) || []).length
      return Math.min(dots + 1, 6)
    }
    if (line === line.toUpperCase()) return 1
    if (/^(Chapter|Section|Part)/i.test(line)) return 1
    return 2
  }

  private static simulatePageLayout(text: string, sections: DocumentSection[]): DocumentPage[] {
    const pages: DocumentPage[] = []
    const lines = text.split("\n")

    let currentPageLines: string[] = []
    let currentPageStartIndex = 0
    let pageNumber = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineLength = line.length + 1

      if (
        currentPageLines.length >= this.LINES_PER_PAGE ||
        currentPageLines.join("\n").length + lineLength > this.CHARS_PER_PAGE
      ) {
        if (currentPageLines.length > 0) {
          const pageContent = currentPageLines.join("\n")
          const pageEndIndex = currentPageStartIndex + pageContent.length

          pages.push({
            pageNumber,
            content: pageContent,
            startIndex: currentPageStartIndex,
            endIndex: pageEndIndex,
            sections: this.getPageSections(sections, currentPageStartIndex, pageEndIndex),
            lineCount: currentPageLines.length,
          })

          pageNumber++
          currentPageStartIndex = pageEndIndex + 1
          currentPageLines = []
        }
      }

      if (line.includes("\f")) {
        const parts = line.split("\f")
        currentPageLines.push(parts[0])

        if (currentPageLines.length > 0) {
          const pageContent = currentPageLines.join("\n")
          const pageEndIndex = currentPageStartIndex + pageContent.length

          pages.push({
            pageNumber,
            content: pageContent,
            startIndex: currentPageStartIndex,
            endIndex: pageEndIndex,
            sections: this.getPageSections(sections, currentPageStartIndex, pageEndIndex),
            lineCount: currentPageLines.length,
          })

          pageNumber++
          currentPageStartIndex = pageEndIndex + 1
          currentPageLines = []
        }

        if (parts[1]) {
          currentPageLines.push(parts[1])
        }
      } else {
        currentPageLines.push(line)
      }
    }

    if (currentPageLines.length > 0) {
      const pageContent = currentPageLines.join("\n")
      const pageEndIndex = currentPageStartIndex + pageContent.length

      pages.push({
        pageNumber,
        content: pageContent,
        startIndex: currentPageStartIndex,
        endIndex: pageEndIndex,
        sections: this.getPageSections(sections, currentPageStartIndex, pageEndIndex),
        lineCount: currentPageLines.length,
      })
    }

    return pages
  }

  private static getPageSections(sections: DocumentSection[], pageStart: number, pageEnd: number): DocumentSection[] {
    return sections.filter(
      (section) =>
        (section.startIndex >= pageStart && section.startIndex <= pageEnd) ||
        (section.endIndex >= pageStart && section.endIndex <= pageEnd) ||
        (section.startIndex <= pageStart && section.endIndex >= pageEnd),
    )
  }

  static searchDocumentAdvanced(
    layout: DocumentLayout,
    query: string,
    options: AdvancedSearchOptions,
  ): AdvancedSearchMatch[] {
    const matches: AdvancedSearchMatch[] = []

    if (!query.trim()) return matches

    let searchPattern: RegExp

    try {
      if (options.useRegex) {
        searchPattern = new RegExp(query, options.matchCase ? "g" : "gi")
      } else if (options.useWildcards) {
        const regexQuery = query
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\\*/g, ".*")
          .replace(/\\\?/g, ".")

        const pattern = options.wholeWord ? `\\b${regexQuery}\\b` : regexQuery
        searchPattern = new RegExp(pattern, options.matchCase ? "g" : "gi")
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const pattern = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
        searchPattern = new RegExp(pattern, options.matchCase ? "g" : "gi")
      }
    } catch (e) {
      console.error("Invalid search pattern:", e)
      return matches
    }

    const text = layout.text
    let match: RegExpExecArray | null

    while ((match = searchPattern.exec(text)) !== null) {
      const matchStart = match.index
      const matchEnd = matchStart + match[0].length

      const page = layout.pages.find((p) => matchStart >= p.startIndex && matchStart <= p.endIndex)
      if (!page) continue

      const textBeforeMatch = text.substring(0, matchStart)
      const lineNumber = (textBeforeMatch.match(/\n/g) || []).length + 1

      const section = layout.sections
        .filter((s) => matchStart >= s.startIndex && matchStart <= s.endIndex)
        .sort((a, b) => b.level - a.level)[0]

      const contextStart = Math.max(0, matchStart - 100)
      const contextEnd = Math.min(text.length, matchEnd + 100)
      const fullContext = text.substring(contextStart, contextEnd)

      const beforeContext = text.substring(contextStart, matchStart)
      const afterContext = text.substring(matchEnd, contextEnd)

      matches.push({
        text: match[0],
        startIndex: matchStart,
        endIndex: matchEnd,
        pageNumber: page.pageNumber,
        lineNumber,
        sectionTitle: section?.title,
        context: fullContext,
        beforeContext,
        afterContext,
      })

      if (match[0].length === 0) {
        searchPattern.lastIndex++
      }
    }

    return options.searchBackwards ? matches.reverse() : matches
  }
}

// Original parseWordDocument function for backward compatibility
export async function parseWordDocument(file: File): Promise<WordParseResult & { images?: string[] }> {
  try {
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer()
      // Try to extract with page breaks preserved
      const result = await mammoth.extractRawText({ arrayBuffer })
      let text = result.value
      // Also try to get HTML to detect page breaks
      let htmlResult
      try {
        htmlResult = await mammoth.convertToHtml({ arrayBuffer })
      } catch (e) {
        console.log("Could not extract HTML from docx")
      }
      const pages = splitIntoPages(text, false, htmlResult?.value)
      // --- Image extraction and OCR ---
      const images: string[] = []
      let ocrText = ""

      try {
        const zip = await JSZip.loadAsync(arrayBuffer)
        const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith("word/media/"))

        // Process OCR for images sequentially to avoid concurrency issues
        for (const mediaName of mediaFiles) {
          const fileData = await zip.files[mediaName].async("base64")
          const ext = mediaName.split('.').pop()?.toLowerCase() || 'png'
          const dataUrl = `data:image/${ext};base64,${fileData}`
          images.push(dataUrl)

          try {
            const result = await Tesseract.recognize(dataUrl, 'eng', {
              logger: (m) => {
                // Optional: log OCR progress
                // console.log(`OCR progress for ${mediaName}:`, m)
              },
            })
            if (result.data && result.data.text) {
              ocrText += '\\n' + result.data.text
            }
          } catch (ocrErr) {
            console.warn('OCR failed for DOCX image', ocrErr)
          }
        }
      } catch (e: any) {
        if (e.message && e.message.includes("end of central directory")) {
          throw new Error("This file is not a valid DOCX file. Please upload a real DOCX file, or convert your .doc file to .docx.")
        } else {
          console.warn("DOCX image extraction failed", e)
        }
      }

      if (ocrText.trim().length > 0) {
        text += '\\n' + ocrText
      }
      // ---
      return {
        text,
        pages,
        isDocFile: false,
        images,
      }
    } else if (fileName.endsWith(".doc")) {
      try {
        const arrayBuffer = await file.arrayBuffer()

        // Try mammoth first
        try {
          const result = await mammoth.extractRawText({ arrayBuffer })
          if (result.value && result.value.trim().length > 0) {
            const text = result.value
            const pages = splitIntoPages(text, true)
            return { text, pages, isDocFile: true }
          }
        } catch (mammothError) {
          console.log("Mammoth failed for .doc file, trying enhanced text extraction")
        }

        // Enhanced text extraction for .doc files
        const extractedText = await extractTextFromDocFile(arrayBuffer, fileName)

        if (extractedText.length > 50) {
          const pages = splitIntoPages(extractedText, true)
          return {
            text: extractedText,
            pages,
            isDocFile: true,
          }
        } else {
          throw new Error("Could not extract meaningful text from .doc file")
        }
      } catch (docError) {
        const errorText = `[Note: This .doc file could not be fully parsed. For better results, please convert to .docx format. File: ${file.name}]`
        return {
          text: errorText,
          pages: [
            {
              pageNumber: 1,
              content: errorText,
              startIndex: 0,
              endIndex: errorText.length,
            },
          ],
          isDocFile: true,
        }
      }
    } else {
      throw new Error("Unsupported Word document format")
    }
  } catch (error: any) {
    console.error("Error parsing Word document:", error)
    const fallbackText = `[Error parsing ${file.name}: ${error.message}. The file may be corrupted or in an unsupported format.]`
    return {
      text: fallbackText,
      pages: [
        {
          pageNumber: 1,
          content: fallbackText,
          startIndex: 0,
          endIndex: fallbackText.length,
        },
      ],
      isDocFile: file.name.toLowerCase().endsWith(".doc"),
    }
  }
}

async function extractTextFromDocFile(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer)
  let extractedText = ""
  let consecutiveNulls = 0
  const maxConsecutiveNulls = 50

  for (let i = 0; i < uint8Array.length; i++) {
    const char = uint8Array[i]

    if (char === 0) {
      consecutiveNulls++
      if (consecutiveNulls > maxConsecutiveNulls) {
        if (extractedText.length > 0 && !extractedText.endsWith("\n")) {
          extractedText += "\n"
        }
        consecutiveNulls = 0
      }
      continue
    } else {
      consecutiveNulls = 0
    }

    if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
      extractedText += String.fromCharCode(char)
    } else if (char >= 160 && char <= 255) {
      extractedText += String.fromCharCode(char)
    } else if (char === 12) {
      // Form feed - actual page break
      extractedText += "\f"
    }
  }

  extractedText = extractedText
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()

  console.log(`Extracted ${extractedText.length} characters from .doc file: ${fileName}`)
  return extractedText
}

function splitIntoPages(
  text: string,
  isDocFile: boolean,
  htmlContent?: string,
): Array<{
  pageNumber: number
  content: string
  startIndex: number
  endIndex: number
}> {
  const pages: Array<{
    pageNumber: number
    content: string
    startIndex: number
    endIndex: number
  }> = []

  console.log(`Splitting document into pages (isDocFile: ${isDocFile})`)

  // Method 1: Look for actual page breaks (form feed characters)
  if (text.includes("\f")) {
    console.log("Found form feed characters - using actual page breaks")
    const pageContents = text.split("\f")
    let currentIndex = 0

    pageContents.forEach((pageContent, index) => {
      if (pageContent.trim()) {
        const cleanContent = pageContent.trim()
        const startIndex = currentIndex
        const endIndex = currentIndex + cleanContent.length

        pages.push({
          pageNumber: index + 1,
          content: cleanContent,
          startIndex,
          endIndex,
        })

        currentIndex = endIndex + 1 // +1 for the form feed character
      }
    })

    if (pages.length > 0) {
      console.log(`Split into ${pages.length} pages using form feed characters`)
      return pages
    }
  }

  // Method 2: Look for HTML page break indicators (for .docx files)
  if (htmlContent && !isDocFile) {
    console.log("Checking HTML content for page breaks")

    // Look for page break indicators in HTML
    const pageBreakPatterns = [
      /<w:br[^>]*w:type="page"[^>]*>/gi,
      /<br[^>]*style="[^"]*page-break-before[^"]*"[^>]*>/gi,
      /<div[^>]*style="[^"]*page-break-before[^"]*"[^>]*>/gi,
    ]

    let hasPageBreaks = false
    for (const pattern of pageBreakPatterns) {
      if (pattern.test(htmlContent)) {
        hasPageBreaks = true
        console.log("Found page break patterns in HTML")
        break
      }
    }

    if (hasPageBreaks) {
      // This is complex - for now, fall through to other methods
      console.log("HTML page breaks detected but not implemented yet")
    }
  }

  // Method 3: Look for common page break patterns in text
  const pageBreakPatterns = [
    /\n\s*\n\s*\n\s*\n/g, // Multiple blank lines
    /\n\s*[-=]{3,}\s*\n/g, // Lines with dashes or equals
    /\n\s*Page\s+\d+\s*\n/gi, // "Page X" indicators
    /\n\s*\d+\s*\n\s*\n/g, // Standalone numbers (page numbers)
  ]

  for (const pattern of pageBreakPatterns) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length > 0) {
      console.log(`Found ${matches.length} potential page breaks using pattern`)

      let lastIndex = 0
      let pageNumber = 1

      matches.forEach((match, index) => {
        const breakIndex = match.index!
        const pageContent = text.substring(lastIndex, breakIndex).trim()

        if (pageContent.length > 100) {
          // Only create page if it has substantial content
          pages.push({
            pageNumber: pageNumber,
            content: pageContent,
            startIndex: lastIndex,
            endIndex: breakIndex,
          })
          pageNumber++
        }

        lastIndex = breakIndex + match[0].length
      })

      // Add the last page
      const lastPageContent = text.substring(lastIndex).trim()
      if (lastPageContent.length > 50) {
        pages.push({
          pageNumber: pageNumber,
          content: lastPageContent,
          startIndex: lastIndex,
          endIndex: text.length,
        })
      }

      if (pages.length > 1) {
        console.log(`Split into ${pages.length} pages using text patterns`)
        return pages
      }
    }
  }

  // Method 4: Estimate pages based on content length and structure
  console.log("Using content-based page estimation")

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

  if (paragraphs.length > 1) {
    const avgCharsPerPage = isDocFile ? 1800 : 2500 // Estimate based on file type
    const totalChars = text.length
    const estimatedPages = Math.max(1, Math.ceil(totalChars / avgCharsPerPage))

    console.log(`Estimated ${estimatedPages} pages based on ${totalChars} characters`)

    if (estimatedPages > 1) {
      const paragraphsPerPage = Math.ceil(paragraphs.length / estimatedPages)
      let currentIndex = 0

      for (let pageNum = 1; pageNum <= estimatedPages; pageNum++) {
        const startParagraph = (pageNum - 1) * paragraphsPerPage
        const endParagraph = Math.min(pageNum * paragraphsPerPage, paragraphs.length)

        const pageParagraphs = paragraphs.slice(startParagraph, endParagraph)
        const pageContent = pageParagraphs.join("\n\n")

        if (pageContent.trim()) {
          const startIndex = currentIndex
          const endIndex = currentIndex + pageContent.length

          pages.push({
            pageNumber: pageNum,
            content: pageContent,
            startIndex,
            endIndex,
          })

          currentIndex = endIndex + 2 // +2 for paragraph separation
        }
      }

      if (pages.length > 1) {
        console.log(`Split into ${pages.length} pages using paragraph distribution`)
        return pages
      }
    }
  }

  // Fallback: Single page
  console.log("Creating single page document")
  pages.push({
    pageNumber: 1,
    content: text,
    startIndex: 0,
    endIndex: text.length,
  })

  console.log(`Final result: ${pages.length} pages`)
  pages.forEach((page, index) => {
    console.log(
      `Page ${page.pageNumber}: ${page.content.length} chars, starts with: "${page.content.substring(0, 50)}..."`,
    )
  })

  return pages
}

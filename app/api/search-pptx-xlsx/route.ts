import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { parseStringPromise } from "xml2js";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js"

async function extractTextFromPPTX(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  let text = "";
  const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
  const slideFiles = Object.keys(zip.files).filter((name) => slideRegex.test(name));
  for (const slideName of slideFiles) {
    const slideXml = await zip.files[slideName].async("string");
    const slideObj = await parseStringPromise(slideXml);
    // Extract all text nodes
    const texts: string[] = [];
    function extractText(obj: any): void {
      if (typeof obj === "string") texts.push(obj);
      else if (typeof obj === "object")
        for (const key in obj) extractText(obj[key]);
    }
    extractText(slideObj["p:sld"]);
    text += texts.join(" ") + "\n";
  }
  return text;
}

async function extractTextFromXLSX(arrayBuffer: ArrayBuffer): Promise<string> {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  let text = "";
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetText = XLSX.utils.sheet_to_csv(sheet);
    text += `Sheet: ${sheetName}\n${sheetText}\n`;
  });
  return text;
}

async function extractImagesFromPPTX(arrayBuffer: ArrayBuffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const images: string[] = [];
  const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith("ppt/media/"));
  for (const mediaName of mediaFiles) {
    const fileData = await zip.files[mediaName].async("base64");
    const ext = mediaName.split('.').pop()?.toLowerCase() || 'png';
    images.push(`data:image/${ext};base64,${fileData}`);
  }
  return images;
}

async function extractImagesAndOcrFromPPTX(arrayBuffer: ArrayBuffer): Promise<{ images: string[], ocrText: string }> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const images: string[] = [];
  let ocrText = "";
  const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith("ppt/media/"));
  for (const mediaName of mediaFiles) {
    const fileData = await zip.files[mediaName].async("base64");
    const ext = mediaName.split('.').pop()?.toLowerCase() || 'png';
    const dataUrl = `data:image/${ext};base64,${fileData}`;
    images.push(dataUrl);
    // OCR: extract text from image
    try {
      const result = await Tesseract.recognize(dataUrl, 'eng');
      if (result.data && result.data.text) {
        ocrText += '\n' + result.data.text;
      }
    } catch (ocrErr) {
      console.warn('OCR failed for PPTX image', ocrErr);
    }
  }
  return { images, ocrText };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const query = formData.get("query") as string;
    const files = formData.getAll("files");
    console.log("[PPTX/XLSX Search] Received query:", query, "Files:", files.length);
    if (!query || files.length === 0) {
      return NextResponse.json({ error: "Missing query or files" }, { status: 400 });
    }
    const results: { file: string; snippet: string; images?: string[] }[] = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      const fileName = file.name.toLowerCase();
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`[PPTX/XLSX Search] Skipping large file: ${file.name} (${file.size} bytes)`);
        continue;
      }
      let content = "";
      let images: string[] = [];
      let ocrText = "";
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (fileName.endsWith(".pptx")) {
          content = await extractTextFromPPTX(arrayBuffer);
          const imgOcr = await extractImagesAndOcrFromPPTX(arrayBuffer);
          images = imgOcr.images;
          ocrText = imgOcr.ocrText;
          if (ocrText.trim().length > 0) {
            content += '\n' + ocrText;
          }
        } else if (fileName.endsWith(".xlsx")) {
          content = await extractTextFromXLSX(arrayBuffer);
        } else {
          continue;
        }
      } catch (fileError) {
        console.error(`[PPTX/XLSX Search] Failed to parse file: ${file.name}`, fileError);
        results.push({ file: file.name, snippet: `Error: Failed to parse file: ${fileError}` });
        continue;
      }
      // Simple search (case-insensitive)
      const regex = new RegExp(query, "i");
      if (regex.test(content)) {
        // Return a snippet around the first match
        const matchIdx = content.search(regex);
        const snippet = content.substring(Math.max(0, matchIdx - 50), matchIdx + 50);
        results.push({ file: file.name, snippet, images });
      }
    }
    return NextResponse.json({ results });
  } catch (e: any) {
    console.error("[PPTX/XLSX Search] API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 
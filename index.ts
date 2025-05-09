
import { serve } from "bun";
import { promisify } from "util";
import * as libre from "libreoffice-convert";
import { tmpdir } from "os";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { extname, join } from "path";

const convertAsync = promisify<Buffer, string, undefined, Buffer>(libre.convert);

serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = extname(file.name) || ".docx";

    try {
      const pdfBuffer = await convertAsync(buffer, ".pdf", undefined);

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=converted.pdf",
        },
      });
    } catch (err) {
      console.error("Conversion failed:", err);
      return new Response("PDF conversion failed", { status: 500 });
    }
  },
});


export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import path from "path";
import os from "os";

export async function POST(request) {
    try {
        const { student } = await request.json();

        console.debug("Student data ===> ", student)
        const { Name: name, course, date } = student;

        if (!name || !course || !date) {
            return NextResponse.json(
                { success: false, message: "Missing required student data (name, course, date)." },
                { status: 400 }
            );
        }

        const { renderToStaticMarkup } = await import("react-dom/server")
        const Certificate = (await import("@/components/certificate")).default

        // Render the React component to an HTML string
        const certHtml = renderToStaticMarkup(
            Certificate({ name, course, date })
        )

        const fullHtml = `
      <!DOCTYPE html>
      <html>
         <head>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=My+Soul&display=swap" rel="stylesheet">
          <style>
            body { 
              margin: 0; 
              font-family: 'Georgia', serif;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${certHtml}
        </body>
      </html>
    `;

        console.debug("\n launching brower using puppeteer...")
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        console.debug("\n launched brower successfully using puppeteer...")

        const page = await browser.newPage();
        await page.setViewport({
            width: 1200,
            height: 1600, // Increased height
            deviceScaleFactor: 2
        });

        await page.setContent(fullHtml, { waitUntil: "networkidle0" });
        await new Promise(resolve => setTimeout(resolve, 1500));

        const tempDir = os.tmpdir();
        const tempPath = path.join(tempDir, `${name.replace(/ /g, "_")}_${Date.now()}.png`);

        await page.screenshot({ path: tempPath, type: 'png', fullPage: true });
        console.log("Saved image at:", tempPath);

        console.debug("\n screenshot saved...")

        await browser.close();
        console.debug("\n browser closed...")

        return NextResponse.json({
            success: true,
            message: "Certificate generated successfully.",
            path: tempPath,
        });

    } catch (error) {
        console.error("Error in /api/generate-certificate:", error);
        return NextResponse.json(
            { success: false, message: "An internal server error occurred while generating the certificate." },
            { status: 500 }
        );
    }
}

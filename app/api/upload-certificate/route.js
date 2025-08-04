export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import path from "path";
import os from "os";
import * as fs from 'fs/promises'
import { Storage } from "@google-cloud/storage";
import { registerUser, sendMessage } from "@/lib/helper";

export async function POST(request) {
  try {
    const { student } = await request.json();

    const { Name: name, course, date: studentDate, phone } = student;
    console.debug("\n\nStudent data ===> ", student)

    const date = studentDate ? studentDate : new Date().toISOString().split("T")[0]


    if (!name || !course) {
      return NextResponse.json(
        { success: false, message: "Missing required student data (name, course)." },
        { status: 400 }
      );
    }

    console.debug(`\n\n Creating certificate of student with data :  `, { name, course, date, phone })

    const { renderToStaticMarkup } = await import("react-dom/server")
    const Certificate = (await import("@/components/certificate")).default

    // Render the React component to an HTML string
    const certHtml = renderToStaticMarkup(
      Certificate({ name, course, date, mode: "server" })
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
        @page { 
          size: A4 landscape; 
          margin: 0; 
        }
        * {
          box-sizing: border-box;
        }
        html, body { 
          margin: 0; 
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: 'Georgia', serif;
          overflow: hidden;
        }
        #certificate-design {
          width: 297mm !important;
          height: 210mm !important;
        }
      </style>
    </head>
    <body>
      ${certHtml}
    </body>
  </html>
`;


    console.debug("\n launching brower using puppeteer...")

    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    console.debug("\n Puppeteer libraries imported successfully")

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.debug("\n launched brower successfully using puppeteer...")

    const page = await browser.newPage();
    await page.setViewport({
      width: 1754,
      height: 1240,
      deviceScaleFactor: 1
    });


    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `${name.replace(/ /g, "_")}_${Date.now()}.pdf`);

    await page.evaluateHandle('document.fonts.ready');
    const certificateElement = await page.$('#certificate-design');

    if (!certificateElement) {
      await browser.close();
      return NextResponse.json(
        { success: false, message: "Certificate element not found." },
        { status: 500 }
      );
    }

    await page.emulateMediaType('screen');


    await page.pdf({
      path: tempPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      displayHeaderFooter: false,
      pageRanges: '1',    // Force single page
    });

    console.log("Saved certificate pdf at:", tempPath);

    console.debug("\n PDF saved...")

    await browser.close();
    console.debug("\n browser closed...")

    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }
    });

    const bucketName = 'certificate-bucket-001';
    const destination = `certificates/${name.replace(/ /g, '_')}.pdf`;

    //Setting Cloud Storage

    await storage.bucket(bucketName).upload(tempPath, {
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
        contentType: 'application/pdf',
      },
    });

    console.debug("\nUploaded on cloud successfully....")
    await fs.unlink(tempPath);

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    console.debug("\n Public url for ss through cloud ==> ", publicUrl)

    //Register Student to interart
    const registerRes = await registerUser(name, phone)

    console.debug("\n Register res ==> ", registerRes)

    if (!registerRes.success) {
      console.warn(registerRes.message)
    }

    // Send Whatsapp Message
    const msgRes = await sendMessage({ phoneNo: phone, course, date, name, publicUrl })

    if (!msgRes.success) {
      return NextResponse.json({
        success: false,
        message: msgRes.message,
        error: msgRes.error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: msgRes.message,
      name: name,
      publicUrl,
    });

  } catch (error) {
    console.error("Error in /api/generate-certificate:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred while generating the certificate." },
      { status: 500 }
    );
  }
}
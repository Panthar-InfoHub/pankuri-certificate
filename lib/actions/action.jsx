"use server"
import Certificate from '@/components/Certificate';
import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import os from "os";
import path from 'path';
import puppeteer from 'puppeteer';
import { renderToStaticMarkup } from 'react-dom/server';

export const dynamic = 'force-dynamic';

export const uploadAction = async ({ name, course }) => {

    try {

        const tempDir = os.tmpdir();

        const certHtml = renderToStaticMarkup(
            <Certificate name={name} course={course} />
        );

        const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        ${certHtml}
      </body>
    </html>
  `;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1120, height: 792, deviceScaleFactor: 2 });
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        const tempPath = path.join(tempDir, `${name.replace(/ /g, '_')}.png`);
        await page.screenshot({ path: tempPath });

        await browser.close();
        console.debug("Screenshot caputred of certificate...")

        const storage = new Storage({
            keyFilename: 'google-service-key.json', // relative to root
        });

        const bucketName = 'your-bucket-name'; // replace this
        const destination = `certificates/${name.replace(/ /g, '_')}.png`;
        
        console.debug("\nStart uploading....")
        await storage.bucket(bucketName).upload(tempPath, {
            destination,
            public: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        console.debug("\nUploaded successfully....")
        await fs.unlink(tempPath);

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

        console.debug("\n Public url ==> ", publicUrl)
        return ({ success: true, message: "Upload sucessfully", publicUrl })

    } catch (error) {
        console.error("Error in upload certificate action ==> ", error)
        return ({ success: false, message: "Error in upload certificate action" })
    }
}

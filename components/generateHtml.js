// lib/utils/certificate-generator.js
import { renderToStaticMarkup } from "react-dom/server"
import Certificate from "@/components/certificate"

export function generateCertificateHTML(name, course, date) {
    const certHtml = renderToStaticMarkup(
        <Certificate name={name} course={course} date={date} />
    )

    return `
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
  `
}
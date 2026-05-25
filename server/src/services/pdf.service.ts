import { chromium } from "playwright";
import { logger } from "../utils/logger";
import katex from "katex";
import { marked } from "marked";

export class PDFService {
  static async generatePDF(
    paperId: string,
    title: string,
    instructions: string,
    sections: any[],
    totalMarks: number,
  ): Promise<Buffer> {
    logger.info(`Generating PDF buffer via Playwright for paper ID: ${paperId}`);

    // Create the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
            
            :root {
              --color-primary: #1A365D;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              color: #1a202c;
              margin: 0;
              padding: 0;
              line-height: 1.5;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            
            .title {
              font-family: 'Bricolage Grotesque', sans-serif;
              font-size: 24pt;
              font-weight: 800;
              color: var(--color-primary);
              margin: 0 0 10px 0;
              letter-spacing: -0.02em;
            }
            
            .meta-grid {
              display: flex;
              justify-content: space-between;
              font-size: 10pt;
              font-weight: 600;
              color: #4a5568;
              margin-bottom: 20px;
            }
            
            .divider {
              height: 2px;
              background-color: #2b6cb0;
              margin-bottom: 20px;
            }
            
            .student-info {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              border: 1px solid #e2e8f0;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            
            .student-info > div {
              padding: 12px;
              border-right: 1px solid #e2e8f0;
            }
            .student-info > div:last-child {
              border-right: none;
            }
            
            .student-info-label {
              font-size: 8pt;
              font-weight: 700;
              color: #4a5568;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            
            .student-info-line {
              border-bottom: 1px solid #cbd5e0;
              height: 15px;
            }
            
            .instructions {
              border-left: 4px solid #2b6cb0;
              background-color: #f8fafc;
              padding: 12px;
              margin-top: 20px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
            }
            
            .instructions-title {
              font-weight: 700;
              font-size: 10pt;
              color: #2b6cb0;
              margin-bottom: 5px;
            }
            
            .instructions-content {
              font-size: 10pt;
            }
            
            .section {
              margin-bottom: 24px;
            }
            
            .section-title {
              font-size: 14pt;
              font-weight: 700;
              color: var(--color-primary);
              border-left: 4px solid var(--color-primary);
              padding-left: 12px;
              margin-bottom: 5px;
              break-after: avoid;
              break-before: auto;
            }
            
            .section-instruction {
              font-size: 10pt;
              font-style: italic;
              color: #718096;
              padding-left: 16px;
              margin-bottom: 12px;
              break-after: avoid;
            }
            
            .question {
              margin-bottom: 20px;
              break-inside: avoid;
              border: 1px solid #f1f5f9;
              padding: 15px;
              border-radius: 8px;
              background-color: #fafbfc;
            }
            
            .question-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .question-text {
              font-size: 11pt;
              font-weight: 500;
              color: #2d3748;
              flex: 1;
              padding-right: 20px;
            }
            
            .question-meta {
              font-size: 9pt;
              font-weight: 700;
              color: #2b6cb0;
              background-color: #ebf8ff;
              padding: 4px 8px;
              border-radius: 4px;
              white-space: nowrap;
            }
            
            .options-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 15px;
              padding-left: 20px;
            }
            
            .option {
              font-size: 10pt;
              color: #4a5568;
              display: flex;
              align-items: baseline;
              background-color: #fff;
              border: 1px solid #e2e8f0;
              padding: 8px;
              border-radius: 6px;
            }
            
            .option-label {
              font-weight: 700;
              margin-right: 10px;
              color: var(--color-primary);
            }
            
            .mermaid-diagram {
              display: block;
              margin: 15px auto;
              max-width: 100%;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              padding: 10px;
              background: #fff;
              overflow: hidden;
            }
            
            .mermaid-diagram svg {
              display: block;
              max-width: 100%;
              height: auto;
            }
            
            /* Markdown rendering fixes */
            .question-text p { margin: 0 0 8px 0; }
            .question-text p:last-child { margin: 0; }
            pre { background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-size: 9pt; overflow-x: auto; }
            code { font-family: monospace; font-size: 0.9em; background-color: #f1f5f9; padding: 2px 4px; border-radius: 3px; }
            pre code { background-color: transparent; padding: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${title}</h1>
          </div>
          
          <div class="meta-grid">
            <div>Total Marks: ${totalMarks} Marks</div>
            <div>Paper ID: ${paperId.substring(0, 8).toUpperCase()}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="student-info">
            <div>
              <div class="student-info-label">STUDENT NAME</div>
              <div class="student-info-line"></div>
            </div>
            <div>
              <div class="student-info-label">ROLL NUMBER</div>
              <div class="student-info-line"></div>
            </div>
            <div>
              <div class="student-info-label">SECTION</div>
              <div class="student-info-line"></div>
            </div>
          </div>
          
          ${instructions ? `
            <div class="instructions">
              <div class="instructions-title">Instructions:</div>
              <div class="instructions-content">${await PDFService.renderMarkdown(instructions)}</div>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px;">
            ${await Promise.all(sections.map(async (section) => `
              <div class="section">
                <div class="section-title">${section.title}</div>
                <div class="section-instruction">${section.instruction}</div>
                
                <div>
                  ${await Promise.all(section.questions.map(async (q: any, qIdx: number) => {
                    const isMCQ =
                      q.type?.toLowerCase().includes("multiple choice") ||
                      q.type?.toLowerCase().includes("mcq") ||
                      section.title?.toLowerCase().includes("multiple choice") ||
                      section.title?.toLowerCase().includes("mcq");
                      
                    return `
                      <div class="question">
                        <div class="question-header">
                          <div class="question-text">
                            <strong>${qIdx + 1}.</strong> ${await PDFService.renderMarkdown(q.question)}
                          </div>
                          <div class="question-meta">
                            [${q.marks} M | ${q.difficulty}]
                          </div>
                        </div>
                        
                        ${(isMCQ && q.options && q.options.length > 0) ? `
                          <div class="options-grid">
                            ${await Promise.all(q.options.map(async (opt: string, oIdx: number) => `
                              <div class="option">
                                <span class="option-label">${String.fromCharCode(65 + oIdx)}.</span>
                                <span>${await PDFService.renderMarkdown(opt)}</span>
                              </div>
                            `)).then(res => res.join(''))}
                          </div>
                        ` : ''}
                      </div>
                    `;
                  })).then(res => res.join(''))}
                </div>
              </div>
            `)).then(res => res.join(''))}
          </div>
        </body>
      </html>
    `;

    try {
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
      });
      
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      logger.error("Failed to generate PDF document layout via Playwright:", error);
      throw error;
    }
  }

  
  // Render a mermaid diagram code string to an inline svg using a headless
  private static async renderMermaidToSVG(code: string): Promise<string> {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(
        `<!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"></head>
          <body>
            <div id="graph" class="mermaid">${code}</div>
            <script type="module">
              import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
              mermaid.initialize({ startOnLoad: false, theme: 'default' });
              const { svg } = await mermaid.render('rendered', document.getElementById('graph').textContent.trim());
              document.getElementById('graph').outerHTML = svg;
            </script>
          </body>
        </html>`,
        { waitUntil: 'networkidle' },
      );
      // give mermaid a moment to finish rendering
      await page.waitForTimeout(500);
      const svg = await page.evaluate(() => document.querySelector('svg')?.outerHTML ?? '');
      return svg || `<pre style="color:red">[Mermaid render failed]</pre>`;
    } catch (err) {
      logger.error('Mermaid SVG render error:', err);
      return `<pre style="color:red">[Mermaid render failed]</pre>`;
    } finally {
      await browser.close();
    }
  }

  private static async renderMarkdown(text: string): Promise<string> {
    if (!text) return "";

    // extract and server-render all mermaid blocks to inline svg
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const mermaidMatches: Array<{ placeholder: string; code: string }> = [];
    let idx = 0;
    let processedText = text.replace(mermaidRegex, (_match, code) => {
      const placeholder = `__MERMAID_PLACEHOLDER_${idx++}__`;
      mermaidMatches.push({ placeholder, code: code.trim() });
      return placeholder;
    });

    // render all mermaid diagrams in parallel
    const renderedSVGs = await Promise.all(
      mermaidMatches.map(({ code }) => PDFService.renderMermaidToSVG(code)),
    );

    // re-inject svgs
    mermaidMatches.forEach(({ placeholder }, i) => {
      processedText = processedText.replace(
        placeholder,
        `<div class="mermaid-diagram">${renderedSVGs[i]}</div>`,
      );
    });

    // handle math blocks
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    processedText = processedText.replace(blockMathRegex, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    const inlineMathRegex = /\$([^$]*?)\$/g;
    processedText = processedText.replace(inlineMathRegex, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // use marked for the rest
    return marked.parse(processedText, { async: false }) as string;
  }
}

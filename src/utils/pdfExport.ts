import html2pdf from 'html2pdf.js';
import type { ReportTier } from '../lib/reportFeatures';

type ExportReportPdfArgs = {
  element: HTMLElement;
  tier: ReportTier;
  foundationScore?: number;
};

function buildFilename(tier: ReportTier, score?: number) {
  const safeScore = typeof score === 'number' ? `-${Math.round(score)}` : '';
  const tierLabel =
    tier === 'premium'
      ? 'premium-report'
      : tier === 'standard'
      ? 'full-report'
      : 'report';

  return `a-wealthy-foundation-${tierLabel}${safeScore}.pdf`;
}

export async function exportReportPdf({
  element,
  tier,
  foundationScore,
}: ExportReportPdfArgs): Promise<void> {
  const filename = buildFilename(tier, foundationScore);

  await html2pdf()
    .set({
      margin: [16, 16, 16, 16],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1440,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('[data-pdf-ignore="true"]').forEach((node) => {
            if (node instanceof HTMLElement) node.style.display = 'none';
          });

          clonedDoc.querySelectorAll('[data-pdf-only="true"]').forEach((node) => {
            if (node instanceof HTMLElement) node.style.display = 'block';
          });

          clonedDoc
            .querySelectorAll('[data-pdf-page-break-before="true"]')
            .forEach((node) => {
              if (node instanceof HTMLElement) {
                node.style.breakBefore = 'page';
                node.style.pageBreakBefore = 'always';
              }
            });

          clonedDoc
            .querySelectorAll('[data-pdf-page-break-avoid="true"], .pdf-avoid-break, section, article')
            .forEach((node) => {
              if (node instanceof HTMLElement) {
                node.style.breakInside = 'avoid';
                node.style.pageBreakInside = 'avoid';
              }
            });

          const root = clonedDoc.getElementById('report-pdf-root');
          if (root instanceof HTMLElement) {
            root.style.background = '#ffffff';
            root.style.padding = '0';
            root.style.margin = '0 auto';
            root.style.maxWidth = '1280px';
            root.style.width = '1280px';
            root.style.minWidth = '1280px';
            root.style.color = '#0f172a';
            root.style.boxSizing = 'border-box';
          }

          clonedDoc.body.style.background = '#ffffff';
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.width = '1280px';
          clonedDoc.body.style.minWidth = '1280px';

          clonedDoc.querySelectorAll('[data-pdf-card="true"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.background = '#ffffff';
              node.style.color = '#0f172a';
              node.style.border = '1px solid #dbe3ea';
              node.style.boxShadow = 'none';
              node.style.backdropFilter = 'none';
            }
          });

          clonedDoc.querySelectorAll('[data-pdf-dark-card="true"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.background = 'linear-gradient(135deg, #17385a 0%, #21456d 100%)';
              node.style.color = '#ffffff';
              node.style.border = '1px solid #dbe3ea';
              node.style.boxShadow = 'none';
            }
          });

          clonedDoc.querySelectorAll('[data-pdf-soft-bg="true"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.background = '#f8fafc';
              node.style.border = '1px solid #e2e8f0';
              node.style.boxShadow = 'none';
            }
          });

          clonedDoc.querySelectorAll('[data-pdf-title="true"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.color = '#0f172a';
            }
          });

          clonedDoc.querySelectorAll('[data-pdf-text="true"]').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.color = '#334155';
            }
          });

          clonedDoc.querySelectorAll('.grid').forEach((node) => {
            if (node instanceof HTMLElement) {
              node.style.alignItems = 'start';
            }
          });
        },
      },
      jsPDF: {
        unit: 'pt',
        format: 'a4',
        orientation: 'landscape',
        compress: true,
      },
      pagebreak: {
        mode: ['css', 'legacy', 'avoid-all'],
        avoid: ['.pdf-avoid-break', 'section', 'article'],
        before: '[data-pdf-page-break-before="true"]',
      },
    })
    .from(element)
    .save();
}

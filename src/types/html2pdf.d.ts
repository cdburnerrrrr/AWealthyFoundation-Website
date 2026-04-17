declare module 'html2pdf.js' {
    type Html2PdfOptions = {
      margin?: number | [number, number] | [number, number, number, number];
      filename?: string;
      image?: {
        type?: 'jpeg' | 'png' | 'webp';
        quality?: number;
      };
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        backgroundColor?: string | null;
        onclone?: (document: Document) => void;
      };
      jsPDF?: {
        unit?: 'pt' | 'mm' | 'cm' | 'in' | 'px';
        format?: string | number[];
        orientation?: 'portrait' | 'landscape';
        compress?: boolean;
      };
      pagebreak?: {
        mode?: Array<'avoid-all' | 'css' | 'legacy'>;
        before?: string;
        after?: string;
        avoid?: string;
      };
    };
  
    interface Html2PdfWorker {
      set(options: Html2PdfOptions): Html2PdfWorker;
      from(element: HTMLElement): Html2PdfWorker;
      save(filename?: string): Promise<void>;
    }
  
    interface Html2PdfStatic {
      (): Html2PdfWorker;
    }
  
    const html2pdf: Html2PdfStatic;
    export default html2pdf;
  }
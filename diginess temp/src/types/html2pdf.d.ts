declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: { type: string; quality: number };
        enableLinks?: boolean;
        html2canvas?: any;
        jsPDF?: any;
    }

    interface Html2PdfWorker {
        from(element: HTMLElement): Html2PdfWorker;
        set(options: Html2PdfOptions): Html2PdfWorker;
        save(): Promise<void>;
        output(type: string, options?: any): Promise<any>;
        outputImg(type: string, options?: any): Promise<any>;
        pdf(options?: any): Promise<any>;
    }

    function html2pdf(): Html2PdfWorker;
    export default html2pdf;
}

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Academy brand colors - updated for a more premium beautiful look
const BRAND = {
  primary: [15, 23, 42] as [number, number, number],        // Slate 900
  accent: [56, 189, 248] as [number, number, number],       // Sky 400
  accentLight: [224, 242, 254] as [number, number, number], // Sky 100
  gray: [100, 116, 139] as [number, number, number],        // Slate 500
  lightGray: [248, 250, 252] as [number, number, number],   // Slate 50
  border: [226, 232, 240] as [number, number, number],      // Slate 200
  white: [255, 255, 255] as [number, number, number],
  success: [16, 185, 129] as [number, number, number],      // Emerald 500
};

// Academy logo JPEG as data URI (Converted from public/logo.png to fix jsPDF bugs)
const LOGO_DATA_URI = "data:image/jpeg;base64,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";

export interface PaymentData {
  id: string;
  studentName: string;
  groupName: string;
  amount: number;
  month: string;
  paidAt: string | null;
}

function drawHeader(pdf: jsPDF, payment: PaymentData) {
  // Colored top bar
  pdf.setFillColor(...BRAND.primary);
  pdf.rect(0, 0, 210, 12, "F");
  
  // Accent line
  pdf.setFillColor(...BRAND.accent);
  pdf.rect(0, 12, 210, 1.5, "F");

  // Logo
  pdf.addImage(LOGO_DATA_URI, "JPEG", 16, 18, 14, 14);

  // Academy name next to logo
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.primary);
  pdf.text("ABYSSAL ACADEMY", 34, 28);

  // Tagline
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("Excellence in Education", 34, 33);

  // Contact info on the right
  pdf.setFontSize(8);
  pdf.setTextColor(...BRAND.gray);
  pdf.text("Tangier, Morocco", 194, 20, { align: "right" });
  pdf.text("yassirgattoa@gmail.com | +212 772529274", 194, 25, { align: "right" });

  // "INVOICE" label with accent background
  pdf.setFillColor(...BRAND.accentLight);
  pdf.roundedRect(156, 32, 38, 10, 2, 2, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.accent);
  pdf.text("INVOICE", 175, 39, { align: "center" });

  // Separator line
  pdf.setDrawColor(...BRAND.border);
  pdf.setLineWidth(0.5);
  pdf.line(16, 46, 194, 46);
}

function drawInvoiceMeta(pdf: jsPDF, payment: PaymentData) {
  const dateStr = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Left column – Invoice info
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("INVOICE NUMBER", 16, 56);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.primary);
  pdf.text("INV-" + payment.id.substring(0, 8).toUpperCase(), 16, 61);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("DATE", 16, 69);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.primary);
  pdf.text(dateStr, 16, 74);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("PAYMENT STATUS", 16, 82);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.success);
  pdf.text("PAID", 16, 87);

  // Right column – Billed to
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("BILLED TO", 110, 56);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.primary);
  pdf.text(payment.studentName, 110, 62);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("Group: " + payment.groupName, 110, 68);

  // Light gray box behind billed-to section
  pdf.setDrawColor(...BRAND.lightGray);
  pdf.setFillColor(...BRAND.lightGray);
  pdf.roundedRect(106, 52, 88, 22, 3, 3, "F");
  // Re-draw text on top of the box
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("BILLED TO", 110, 56);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.primary);
  pdf.text(payment.studentName, 110, 62);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("Group: " + payment.groupName, 110, 68);

  // Separator before table
  pdf.setDrawColor(...BRAND.border);
  pdf.setLineWidth(0.3);
  pdf.line(16, 96, 194, 96);
}

function drawTable(pdf: jsPDF, payment: PaymentData): number {
  autoTable(pdf, {
    startY: 104,
    head: [["Description", "Month", "Amount"]],
    body: [["Tuition Fee – " + payment.groupName, payment.month, payment.amount.toLocaleString() + " DH"]],
    theme: "plain",
    headStyles: {
      fillColor: BRAND.accentLight,
      textColor: BRAND.primary,
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      minCellHeight: 14,
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [55, 65, 81],
      cellPadding: { top: 10, right: 8, bottom: 10, left: 8 },
      minCellHeight: 16,
      fillColor: BRAND.white,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: "normal" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 16, right: 16 },
    tableLineColor: BRAND.border,
    tableLineWidth: 0.3,
    didDrawCell: (data) => {
      // Custom drawing if needed
    },
  });

  const finalY = (pdf as any).lastAutoTable?.finalY || 140;
  return finalY;
}

function drawTotals(pdf: jsPDF, payment: PaymentData, startY: number) {
  // Subtle background for totals area
  pdf.setFillColor(...BRAND.lightGray);
  pdf.roundedRect(120, startY + 4, 74, 34, 2, 2, "F");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.primary);
  pdf.text("Subtotal", 126, startY + 14);
  pdf.text(payment.amount.toLocaleString() + " DH", 188, startY + 14, { align: "right" });

  // Subtle line
  pdf.setDrawColor(...BRAND.border);
  pdf.setLineWidth(0.2);
  pdf.line(126, startY + 18, 188, startY + 18);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND.primary);
  pdf.text("TOTAL PAID", 126, startY + 30);
  pdf.text(payment.amount.toLocaleString() + " DH", 188, startY + 30, { align: "right" });

  return startY + 44;
}

function drawFooter(pdf: jsPDF) {
  const pageHeight = pdf.internal.pageSize.height;

  // Bottom bar
  pdf.setFillColor(...BRAND.primary);
  pdf.rect(0, pageHeight - 8, 210, 8, "F");

  // Footer text
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BRAND.gray);
  pdf.text("Thank you for your payment! — Abyssal Academy", 105, pageHeight - 12, { align: "center" });

  // Small legal line
  pdf.setFontSize(6);
  pdf.setTextColor(...BRAND.border);
  pdf.text("This is a computer-generated document. No signature required.", 105, pageHeight - 18, { align: "center" });
}

export function generateInvoice(payment: PaymentData, doc?: jsPDF, isFirstPage = true): jsPDF {
  const pdf = doc || new jsPDF();

  if (!isFirstPage) {
    pdf.addPage();
  }

  drawHeader(pdf, payment);
  drawInvoiceMeta(pdf, payment);
  const finalY = drawTable(pdf, payment);
  const nextY = drawTotals(pdf, payment, finalY);
  drawFooter(pdf);

  return pdf;
}

export function downloadInvoice(payment: PaymentData) {
  const doc = generateInvoice(payment);
  doc.save("Invoice-" + payment.studentName.replace(/\s+/g, "_") + "-" + payment.month + ".pdf");
}

export function downloadMultipleInvoices(payments: PaymentData[]) {
  if (payments.length === 0) return;
  const doc = new jsPDF();
  payments.forEach((payment, index) => {
    generateInvoice(payment, doc, index === 0);
  });
  doc.save("Invoices-" + new Date().toISOString().split("T")[0] + ".pdf");
}

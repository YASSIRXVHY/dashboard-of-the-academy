content = '''import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface PaymentData {
  id: string;
  studentName: string;
  groupName: string;
  amount: number;
  month: string;
  paidAt: string | null;
}

export function generateInvoice(payment: PaymentData, doc?: jsPDF, isFirstPage = true): jsPDF {
  const pdf = doc || new jsPDF();
  
  if (!isFirstPage) {
    pdf.addPage();
  }

  // Header
  pdf.setFontSize(22);
  pdf.setTextColor(40, 40, 40);
  pdf.text("FACTURE / INVOICE", 105, 20, { align: "center" });

  // Academy details
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Abyssal Academy", 105, 28, { align: "center" });
  pdf.text("123 Education Street, Learning City", 105, 33, { align: "center" });
  pdf.text("Email: contact@abyssalacademy.com", 105, 38, { align: "center" });

  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 45, 190, 45);

  // Invoice Details
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Facture N°: INV-" + payment.id.substring(0, 8).toUpperCase(), 20, 60);
  const dateStr = payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date().toLocaleDateString();
  pdf.text("Date: " + dateStr, 20, 68);

  // Student Details
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Facturé à / Billed To:", 120, 60);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.studentName, 120, 68);
  pdf.text("Groupe: " + payment.groupName, 120, 76);

  // Table
  autoTable(pdf, {
    startY: 95,
    head: [["Description", "Mois / Month", "Montant / Amount"]],
    body: [
      ["Frais de scolarité / Tuition Fee", payment.month, payment.amount.toLocaleString() + " DH"],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "right" }
    },
  });

  const finalY = (pdf as any).lastAutoTable?.finalY || 120;

  // Total
  pdf.setFont("helvetica", "bold");
  pdf.text("Total Payé:", 120, finalY + 15);
  pdf.text(payment.amount.toLocaleString() + " DH", 170, finalY + 15, { align: "right" });

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Merci pour votre paiement ! / Thank you for your payment!", 105, 270, { align: "center" });

  return pdf;
}

export function downloadInvoice(payment: PaymentData) {
  const doc = generateInvoice(payment);
  doc.save("Facture-" + payment.studentName.replace(/\s+/g, "_") + "-" + payment.month + ".pdf");
}

export function downloadMultipleInvoices(payments: PaymentData[]) {
  if (payments.length === 0) return;
  const doc = new jsPDF();
  payments.forEach((payment, index) => {
    generateInvoice(payment, doc, index === 0);
  });
  doc.save("Factures-Multiples-" + new Date().toISOString().split("T")[0] + ".pdf");
}
'''

with open('src/lib/pdf-utils.ts', 'w', encoding='utf-8') as f:
    f.write(content)

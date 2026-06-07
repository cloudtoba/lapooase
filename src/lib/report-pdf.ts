"use client";

// Small browser-side PDF writer for simple text reports without adding a PDF dependency.
import { formatIDR } from "@/lib/currency";
import type { Order } from "@/types/pos";

type ReportSummary = {
  dateLabel: string;
  totalOrders: number;
  totalSales: number;
  bestSellingItem?: [string, number];
  orders: Order[];
};

function cleanText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(value: number) {
  return cleanText(formatIDR(value));
}

function wrapLine(line: string, maxLength = 92) {
  const words = cleanText(line).split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function buildReportLines(summary: ReportSummary) {
  const bestSeller = summary.bestSellingItem ? `${summary.bestSellingItem[0]} (${summary.bestSellingItem[1]} sold)` : "None";
  const lines = [
    "LAPO OASE - DAILY SALES REPORT",
    `Date: ${summary.dateLabel}`,
    "",
    `Total orders today: ${summary.totalOrders}`,
    `Total sales today: ${money(summary.totalSales)}`,
    `Best-selling item: ${bestSeller}`,
    "",
    "ORDER DETAILS"
  ];

  if (summary.orders.length === 0) {
    lines.push("No orders recorded today.");
    return lines;
  }

  summary.orders.forEach((order) => {
    lines.push("");
    lines.push(`Order #${order.orderNumber} | ${new Date(order.createdAt).toLocaleTimeString()} | ${order.status.toUpperCase()}`);
    if (order.customerName) {
      lines.push(`Customer: ${order.customerName}`);
    }
    order.items.forEach((item) => {
      lines.push(`- ${item.qty} x ${item.name} @ ${money(item.price)} = ${money(item.qty * item.price)}`);
    });
    if (order.notes) {
      lines.push(`Notes: ${order.notes}`);
    }
    lines.push(`Order total: ${money(order.total)}`);
  });

  return lines.flatMap((line) => wrapLine(line));
}

export function downloadDailyReportPdf(summary: ReportSummary) {
  const lines = buildReportLines(summary);
  const pageHeight = 842;
  const marginX = 48;
  const startY = 790;
  const lineHeight = 16;
  const linesPerPage = Math.floor((startY - 48) / lineHeight);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const fontObjectId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageObjectIds: number[] = [];

  pages.forEach((pageLines, pageIndex) => {
    const textRows = pageLines
      .map((line, lineIndex) => {
        const y = startY - lineIndex * lineHeight;
        const fontSize = pageIndex === 0 && lineIndex === 0 ? 16 : 10;
        return `BT /F1 ${fontSize} Tf ${marginX} ${y} Td (${pdfEscape(line)}) Tj ET`;
      })
      .join("\n");

    const contentObjectId = addObject(`<< /Length ${textRows.length} >>\nstream\n${textRows}\nendstream`);
    const pageObjectId = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    );
    pageObjectIds.push(pageObjectId);
  });

  const pagesObjectId = addObject(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`);
  pageObjectIds.forEach((pageObjectId) => {
    objects[pageObjectId - 1] = objects[pageObjectId - 1].replace("/Parent 0 0 R", `/Parent ${pagesObjectId} 0 R`);
  });
  const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lapo-oase-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

#!/usr/bin/env node

// Imports the old Google Sheets expense workbook into Supabase.
// Default mode is a dry run; pass --apply to write rows to public.pos_expenses.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const MONTHS_ID = new Map([
  ["januari", 1],
  ["februari", 2],
  ["maret", 3],
  ["april", 4],
  ["mei", 5],
  ["juni", 6],
  ["july", 7],
  ["juli", 7],
  ["agustus", 8],
  ["september", 9],
  ["oktober", 10],
  ["november", 11],
  ["desember", 12]
]);

const args = process.argv.slice(2);
const filePath = args.find((arg) => !arg.startsWith("--"));
const shouldApply = args.includes("--apply");
const yearArg = args.find((arg) => arg.startsWith("--year="));
const importYear = yearArg ? Number(yearArg.split("=")[1]) : 2026;

if (!filePath) {
  console.error('Usage: npm run import:expenses -- "/path/to/Catatan pengeluaran.xlsx" [--apply] [--year=2026]');
  process.exit(1);
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value ?? "")
    .replace(/[()]/g, "")
    .replace(/[^\d.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function parseIndonesianDate(value, fallbackYear = importYear) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = normalizeText(value).toLowerCase();
  const match = text.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/i);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = MONTHS_ID.get(match[2]);
  const year = match[3] ? Number(match[3]) : fallbackYear;

  if (!day || !month || !year) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function makeExpenseId(expense) {
  const source = [expense.expense_date, expense.description, expense.amount, expense.source_sheet, expense.source_row].join("|");
  return `sheet-expense-${crypto.createHash("sha1").update(source).digest("hex").slice(0, 24)}`;
}

function findHeaderRow(worksheet) {
  for (let rowNumber = 1; rowNumber <= Math.min(10, worksheet.rowCount); rowNumber += 1) {
    const values = worksheet.getRow(rowNumber).values.slice(1).map(normalizeHeader);
    if (values.includes("keterangan") && values.includes("kredit")) {
      return rowNumber;
    }
  }

  return null;
}

function parseWorksheet(worksheet) {
  const headerRowNumber = findHeaderRow(worksheet);
  if (!headerRowNumber) {
    return [];
  }

  const fallbackDate = parseIndonesianDate(worksheet.name);
  const headerValues = worksheet.getRow(headerRowNumber).values.slice(1).map(normalizeHeader);
  const descriptionIndex = headerValues.indexOf("keterangan") + 1;
  const creditIndex = headerValues.indexOf("kredit") + 1;
  const dateIndex = headerValues.indexOf("tanggal") + 1;

  const expenses = [];

  for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const description = normalizeText(row.getCell(descriptionIndex).value);
    const amount = toNumber(row.getCell(creditIndex).value);
    const rowDate = dateIndex > 0 ? parseIndonesianDate(row.getCell(dateIndex).value) : null;
    const expenseDate = rowDate ?? fallbackDate;

    if (!description || description.toLowerCase() === "uang kas" || amount <= 0 || !expenseDate) {
      continue;
    }

    const expense = {
      expense_date: expenseDate,
      description,
      category: "Lainnya",
      amount,
      payment_method: "Cash",
      vendor: null,
      notes: `Imported from ${worksheet.name} row ${rowNumber}`,
      source_sheet: worksheet.name,
      source_row: rowNumber
    };

    expenses.push({
      id: makeExpenseId(expense),
      created_at: `${expenseDate}T05:00:00.000+07:00`,
      expense_date: expense.expense_date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      payment_method: expense.payment_method,
      vendor: expense.vendor,
      notes: expense.notes
    });
  }

  return expenses;
}

function summarize(expenses) {
  const byDate = new Map();
  for (const expense of expenses) {
    const current = byDate.get(expense.expense_date) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += expense.amount;
    byDate.set(expense.expense_date, current);
  }

  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
}

async function main() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.resolve(filePath));

  const expenses = workbook.worksheets.flatMap(parseWorksheet);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  console.log(`Found ${expenses.length} expenses in ${workbook.worksheets.length} sheets.`);
  console.log(`Total amount: IDR ${Math.round(total).toLocaleString("id-ID")}`);
  console.log("");
  console.table(
    summarize(expenses).map(([date, summary]) => ({
      date,
      count: summary.count,
      total: Math.round(summary.total)
    }))
  );

  if (!shouldApply) {
    console.log("");
    console.log("Dry run only. Add --apply to import these rows into Supabase.");
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const chunkSize = 100;

  for (let index = 0; index < expenses.length; index += chunkSize) {
    const chunk = expenses.slice(index, index + chunkSize);
    const { error } = await supabase.from("pos_expenses").upsert(chunk, { onConflict: "id" });

    if (error) {
      throw error;
    }

    console.log(`Imported ${Math.min(index + chunk.length, expenses.length)} / ${expenses.length}`);
  }

  console.log("Import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

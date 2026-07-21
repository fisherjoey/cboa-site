/**
 * Thin SheetJS wrapper — the only place that imports `xlsx`.
 * Reads an uploaded .xlsx or .csv file into a raw array-of-rows, then hands off
 * to the pure `normalizeGameRows` parser. Runs client-side (browser File API).
 */
import * as XLSX from 'xlsx'
import { normalizeGameRows } from './arbiterGameInfo'
import type { ParseResult } from './types'

/** SHA-256 of the file bytes, hex — the whole-file idempotency key. */
export async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Read the first worksheet of a File into raw rows (array of arrays). */
export async function readSheetRows(file: File): Promise<unknown[][]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const first = wb.SheetNames[0]
  if (!first) return []
  const ws = wb.Sheets[first]
  // header:1 => array of arrays; raw values preserved (dates as Date via cellDates).
  return XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: '' })
}

/** Full client-side pipeline: File -> normalized, validated games + file hash. */
export async function parseArbiterFile(file: File): Promise<ParseResult & { fileHash: string }> {
  const [rows, fileHash] = await Promise.all([readSheetRows(file), hashFile(file)])
  const result = normalizeGameRows(rows)
  return { ...result, fileHash }
}

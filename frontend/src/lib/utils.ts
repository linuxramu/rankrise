import { clsx, type ClassValue } from 'clsx'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Format seconds into mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/** Format a percentage to 1 decimal place */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/** Map exam type to display label */
export const EXAM_LABELS: Record<string, string> = {
  JEE_MAINS: 'JEE Mains',
  JEE_ADVANCED: 'JEE Advanced',
  NEET: 'NEET',
  EAPCET: 'EAPCET',
}

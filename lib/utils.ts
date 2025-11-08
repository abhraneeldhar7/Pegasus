import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatDateTime(date: Date) {
  if (!date) return ""

  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "short" }) // e.g. "Nov"
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${day} ${month} ${hours}:${minutes}`
}
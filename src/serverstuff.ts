import { randomBytes } from 'crypto'

export function qr() {
  const qr = randomBytes(12).toString('hex')
  return `${Date.now()}${qr}`;
}



export type CheckReturn<T> = Promise<T | null>
export type APIResponse<T> = T | { error: string }

const email = import.meta.env.VITE_EMAIL_USER
const pw = import.meta.env.VITE_EMAIL_PASSWORD

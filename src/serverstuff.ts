import { PrismaClient, type Ticket as T, type Merch as M } from '@prisma/client'

import { randomBytes } from 'crypto'
const prisma = new PrismaClient()

export function qr() {
  const qr = randomBytes(12).toString('hex')
  return `${Date.now()}${qr}`;
}

export type Ticket = T & { valid: boolean }
export type Merch = M & { valid: boolean }


export type CheckReturn<T> = Promise<T | null>
export type APIResponse<T> = T | { error: string }



export const model = prisma.$extends({
  result: {
    ticket: {
      valid: {
        needs: { checkInAt: true },
        compute(data) {
          return data.checkInAt === null
        }
      },
    },

    merch: {
      valid: {
        needs: { claimedAt: true },
        compute(data) {
          return data.claimedAt === null
        },
      }
    }
  },

})


import nodemailer from "nodemailer"

const email = import.meta.env.VITE_EMAIL_USER
const pw = import.meta.env.VITE_EMAIL_PASSWORD


const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pw
  },
})


export async function sendMail({ to, name, base64string, as = "e-Ticket" }: { to: string, base64string: string, as?: "e-Ticket" | "e-Ticket dan Merch Receipt", name: string }) {

  return await transport.sendMail({
    from: "Loudeast Media",
    to: to,
    text: `Hi ${name}, 
    Lampiran dibawah ini adalah ${as} ${import.meta.env.VITE_EVENT_NAME} kamu.
        Kami sarankan untuk tidak menunjukkan ${as} kamu kepada siapapun sebelum acara.

        See you at the venue.
        `,
    html: `<!DOCTYPE html><html><head><title>${as}</title></head><body><h1>Hi ${name},<h1><br/><p>Lampiran dibawah ini adalah ${as} ${import.meta.env.VITE_EVENT_NAME} kamu</p><strong>Kami sarankan untuk tidak menunjukkan ${as} kamu kepada siapapun sebelum acara.</strong><br/><br/><p>See you at the venue.</p></body></html>`
    ,
    subject: `${as} ${import.meta.env.VITE_EVENT_NAME}`,
    attachments: [
      {
        path: base64string,
        filename: `${as}.pdf`
      }
    ]


  })
}
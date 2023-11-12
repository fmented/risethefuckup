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


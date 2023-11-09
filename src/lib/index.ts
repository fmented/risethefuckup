import { PrismaClient, TicketClass, type Ticket } from '@prisma/client'

const prisma = new PrismaClient().$extends({
    result: {
        ticket: {
            valid: {
                needs: { used: true },
                compute(ticket) {
                    return ticket.used === 0
                },
            },
        },
    },
})

export type TicketExtended = Ticket & { valid: boolean }

export async function getQrUsedCount(qr: string): Promise<TicketExtended | null> {
    try {
        const x = await prisma.ticket.findUnique({
            where: { qr }
        })

        return x ? x : null
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function addCount(qr: string): Promise<TicketExtended | null> {
    try {
        const x = await prisma.ticket.update({
            where: {
                qr
            },
            data: {
                used: { increment: 1 }
            }
        })

        return x ? { ...x, used: x.used - 1 } : null

    } catch (error) {
        console.error(error)
        return null
    }
}

export async function subtractCount(qr: string): Promise<TicketExtended | null> {
    try {
        const x = await prisma.ticket.update({
            where: {
                qr
            },
            data: {
                used: { decrement: 1 }
            }
        })

        return x ? { ...x, used: x.used - 1 } : null

    } catch (error) {
        console.error(error)
        return null
    }
}


export async function createQr(qr: string, _class: TicketClass) {
    return prisma.ticket.create({
        data: {
            qr,
            class: _class
        }
    })
}
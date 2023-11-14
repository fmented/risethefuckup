import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { id, qr }: { id: string, qr: string } = await request.json()
        let ticket: any
        if (qr) {
            ticket = await model.ticket.findUnique({ where: { qr } })
        }
        else if (id) {
            ticket = await model.ticket.findFirst({ where: { id } })
        }
        return new Response(ticket ? JSON.stringify(ticket) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
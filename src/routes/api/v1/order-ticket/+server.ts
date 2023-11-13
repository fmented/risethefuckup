import { model, qr } from '../../../../serverstuff'
import type { MerchSize } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const data: { name: string } = await request.json()
        const ticket = await model.ticket.create({
            data: { ...data, qr: qr() }
        })

        return new Response(ticket ? JSON.stringify(ticket) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
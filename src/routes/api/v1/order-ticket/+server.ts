import { model, qr } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const data: { name: string, email: string } = await request.json()
        const ticket = await model.ticket.create({
            data: { name: data.name, qr: qr(), email: data.email },
        })

        return new Response(ticket ? JSON.stringify(ticket) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
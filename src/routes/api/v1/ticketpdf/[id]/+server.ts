import { model, generateTicket } from '../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies, params, fetch }) => {
    try {
        const qr = params.id
        const ticket = await model.ticket.findUnique({ where: { qr } })
        if (ticket == null || typeof ticket?.name !== "string")
            return new Response(JSON.stringify({ error: "Unknown QrCode" }));
        const b = await generateTicket(ticket)

        return new Response(await b.arrayBuffer());
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
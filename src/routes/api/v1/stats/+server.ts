import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies }) => {

    try {
        const merchs = await model.merch.findMany()
        const tickets = await model.ticket.findMany()
        merchs.reverse()
        tickets.reverse()

        return new Response(JSON.stringify({ merchs, tickets }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
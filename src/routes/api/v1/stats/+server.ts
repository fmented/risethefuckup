import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies }) => {

    try {
        const tickets = await model.ticket.findMany({ include: { Merch: true }, orderBy: { createdAt: "desc" } })
        return new Response(JSON.stringify({ tickets }));
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ error: error }));
    }

}
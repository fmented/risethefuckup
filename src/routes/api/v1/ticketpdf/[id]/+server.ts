import { model, generateTicket } from '../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, params, fetch }) => {
    try {
        const id = params.id
        const send = url.searchParams.get("send") == "true"

        const ticket = await model.ticket.findUnique({ where: { id } })
        if (ticket == null || typeof ticket?.name !== "string")
            return new Response(JSON.stringify({ error: "Unknown QrCode" }));
        const b = await generateTicket(ticket)
        const arrayBuff = await b.arrayBuffer()

        if (send)
            return new Response(arrayBuff);

        const buff = Buffer.from(arrayBuff)
        const base64string = `data:application/pdf;base64,${buff.toString("base64")}`

        return new Response(JSON.stringify({ ticket, pdf: base64string }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
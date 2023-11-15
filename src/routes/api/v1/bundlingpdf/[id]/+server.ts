import { model, generateReceipt, sendMail, } from '../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ fetch, cookies, params, request, url }) => {
    try {
        const id = params.id
        const send = url.searchParams.get("send") == "true"
        const merch = await model.merch.findUnique({ where: { id }, include: { ticket: true } })
        if (merch == null || typeof merch?.name !== "string")
            return new Response(JSON.stringify({ error: "Unknown QrCode" }));

        const b = await generateReceipt(merch)
        const arrayBuff = await b.arrayBuffer()

        if (!send)
            return new Response(arrayBuff);


        const buff = Buffer.from(arrayBuff)
        const base64string = `data:application/pdf;base64,${buff.toString("base64")}`

        await fetch(`/api/v1/bundlingpdf/${id}/send`, {
            method: "POST",
            body: JSON.stringify({
                to: merch.ticket.email,
                name: merch.name,
                pdf: base64string
            })
        })
        return new Response(arrayBuff);

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
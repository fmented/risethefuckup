import { model, generateReceipt, sendMail, } from '../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ fetch, cookies, params, request, url }) => {
    try {
        const id = params.id
        const merch = await model.merch.findUnique({ where: { id }, include: { ticket: true } })
        if (merch == null || typeof merch?.name !== "string")
            return new Response(JSON.stringify({ error: "Unknown QrCode" }));

        const b = await generateReceipt(merch)
        const arrayBuff = await b.arrayBuffer()
        const buff = Buffer.from(arrayBuff)
        const base64string = `data:application/pdf;base64,${buff.toString("base64")}`


        return new Response(JSON.stringify({
            merch,
            pdf: base64string
        }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
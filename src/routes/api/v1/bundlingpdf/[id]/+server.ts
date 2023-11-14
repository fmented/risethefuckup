import { model, generateReceipt, } from '../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies, params }) => {
    try {
        const id = params.id
        const merch = await model.merch.findUnique({ where: { id }, include: { ticket: true } })
        if (merch == null || typeof merch?.name !== "string")
            return new Response(JSON.stringify({ error: "Unknown QrCode" }));

        const b = await generateReceipt(merch)

        return new Response(await b.arrayBuffer());
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
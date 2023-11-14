import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { qr, id }: { qr?: string, id?: string } = await request.json()

        let merch: any
        if (qr) {
            merch = await model.merch.findUnique({ where: { qr } })
        }
        else if (id) {
            merch = await model.merch.findFirst({ where: { id } })
        }



        return new Response(merch ? JSON.stringify(merch) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { qr }: { qr: string } = await request.json()
        const merch = await model.merch.findUnique({ where: { qr } })

        return new Response(merch ? JSON.stringify(merch) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
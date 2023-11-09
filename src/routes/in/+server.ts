import { getQrUsedCount, addCount, type TicketExtended } from '$lib'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    let v: TicketExtended | null

    try {
        const qr: Pick<TicketExtended, "qr"> = await request.json()
        v = await addCount(qr.qr)

        return new Response(v ? JSON.stringify(v) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }


    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
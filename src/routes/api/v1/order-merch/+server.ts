import { model, qr } from '../../../../serverstuff'
import type { MerchSize } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const data: { name: string, size: MerchSize } = await request.json()
        const merch = await model.merch.create({
            data: { ...data, qr: qr() }
        })

        return new Response(merch ? JSON.stringify(merch) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
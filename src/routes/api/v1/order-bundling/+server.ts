import { model, qr } from '../../../../serverstuff'
import type { MerchSize } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const data: { name: string, size: MerchSize, email: string } = await request.json()
        const merch = await model.merch.create({
            data: {
                name: data.name,
                size: data.size,
                qr: qr(),
                ticket: {
                    create: {
                        qr: qr(),
                        name: data.name,
                        email: data.email
                    }
                }
            }
        })

        return new Response(merch ? JSON.stringify(merch) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
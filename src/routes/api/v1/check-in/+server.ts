import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { qr }: { qr: string } = await request.json()
        const ticket = await model.ticket.update(
            {
                where: { qr },
                data: { checkInAt: new Date() }
            }
        )

        return new Response(ticket ? JSON.stringify(ticket) : JSON.stringify({ error: "Unknown QrCode" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ error: "Unknown QrCode" }));
}
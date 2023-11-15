import { sendMail } from '../../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { name, to, pdf }: { name: string, to: string, pdf: string } = await request.json()

        sendMail({ to, name, base64string: pdf, as: "e-Ticket dan Merch Receipt" })


        return new Response(JSON.stringify({ status: "Success" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "Failed" }));
}
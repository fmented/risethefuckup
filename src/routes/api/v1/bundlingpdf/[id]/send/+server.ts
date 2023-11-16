import { sendMail } from '../../../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const to = request.headers.get("to")!
        const name = request.headers.get("name")!
        const body = await request.arrayBuffer()
        const pdf = "data:application/pdf;base64," + Buffer.from(body).toString("base64")
        // const { name, to, pdf }: { name: string, to: string, pdf: string } = decompress(JSON.parse(body))


        await sendMail({ to, name, base64string: pdf, as: "e-Ticket dan Merch Receipt" })


        return new Response(JSON.stringify({ status: "Success" }));
    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "Failed" }));
}
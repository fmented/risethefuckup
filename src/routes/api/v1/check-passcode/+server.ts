import { model } from '../../../../serverstuff'
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const passcode = request.headers.get("passcode")
        return new Response(JSON.stringify({ status: passcode === process.env.PASSCODE ? "success" : "failed" }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "failed" }));
}
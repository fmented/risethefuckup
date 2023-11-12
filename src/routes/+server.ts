import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {

    try {
        const passcode = request.headers.get("passcode")
        if (typeof passcode === "string" && passcode === process.env.PASSCODE) {
            cookies.set("passcode", passcode)
            throw redirect(302, "checkin")
        }
        return new Response(JSON.stringify({ status: "failed" }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "failed" }));
}

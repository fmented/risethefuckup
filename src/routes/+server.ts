import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {

    try {
        const passcode = request.headers.get("passcode")
        if (typeof passcode === "string" && passcode === import.meta.env.VITE_PASSCODE) {
            cookies.set("passcode", passcode)
            throw redirect(302, "/check-in")
        }
        return new Response(JSON.stringify({ status: "failed" }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "failed" }));
}


export const GET: RequestHandler = async ({ cookies, request }) => {

    const passcode = cookies.get("passcode")

    if (passcode === import.meta.env.VITE_PASSCODE) {
        throw redirect(302, "/check-in")
    }

    return new Response()
}

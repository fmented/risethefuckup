import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request, }) => {

    try {
        const passcode = request.headers.get("passcode")
        if (passcode === import.meta.env.VITE_PASSCODE) {
            cookies.set("passcode", passcode!)
            throw redirect(302, "/check-in")
        }
        return new Response(JSON.stringify({ status: "failed" }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "failed" }));
}

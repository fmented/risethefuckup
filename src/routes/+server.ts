import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request, }) => {

    try {
        const passcode = request.headers.get("passcode")
        if (passcode === import.meta.env.VITE_PASSCODE) {
            cookies.set("passcode", passcode!, {
                path: "/",
            })
            return new Response(null, {
                status: 302,
                headers: new Headers({ Location: "/check-in" })
            })
        }
        return new Response(JSON.stringify({ status: import.meta.env.VITE_PASSCODE }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: import.meta.env.VITE_PASSCODE }));
}

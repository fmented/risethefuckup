import type { RequestHandler } from '@sveltejs/kit';
import cookie from "cookie"
export const POST: RequestHandler = async ({ cookies, request, }) => {

    try {
        const passcode = request.headers.get("passcode") || ""
        if (passcode === import.meta.env.VITE_PASSCODE) {
            cookies.set("passcode", passcode!, {
                path: "/",
            })

            const r = new Response(null, {
                status: 301,
                headers: new Headers({
                    Location: "/check-in", "Set-Cookie": cookie.serialize("passcode", passcode, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 30

                    })
                })
            })
            return r
        }
        return new Response(JSON.stringify({ status: import.meta.env.VITE_PASSCODE }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: import.meta.env.VITE_PASSCODE }));
}

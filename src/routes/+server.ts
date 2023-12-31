import type { RequestHandler } from '@sveltejs/kit';
import jwt from "jsonwebtoken"

export const POST: RequestHandler = async ({ cookies, request, }) => {

    try {
        let data = request.headers.get("passcode") || ""
        data = atob(data)
        const obj = JSON.parse(data)
        const passcode = atob(obj.passcode)

        if (passcode === import.meta.env.VITE_PASSCODE) {
            const token = jwt.sign({
                data: { passcode: import.meta.env.VITE_PASSCODE, since: Date.now() },
            }, import.meta.env.VITE_SECRET, {});

            cookies.set("passcode", token, {
                maxAge: 60 * 60 * 24 * 3
            })

            return new Response(JSON.stringify({ status: "Success" }), {
                status: 302,
                statusText: "/stats",
                headers: {
                    Location: "/stats"
                }
            });

        }
        return new Response(JSON.stringify({ status: "Invalid Passcode" }));

    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ status: "Invalid Passcode" }));
    }

}



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
                data: { passcode: import.meta.env.VITE_PASSCODE, since: Date.now() }
            }, import.meta.env.VITE_SECRET, {});
            console.log(passcode, import.meta.env.VITE_PASSCODE);

            cookies.set("passcode", token)

            return new Response(JSON.stringify({ status: "Success" }), {
                status: 302,
                statusText: "/check-in",
                headers: {
                    Location: "/check-in"
                }
            });

        }
        return new Response(JSON.stringify({ status: "Invalid Passcode" }));

    } catch (error) {
        console.log(error)
    }

    return new Response(JSON.stringify({ status: "Invalid Passcode" }));
}



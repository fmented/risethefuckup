import { redirect } from '@sveltejs/kit';
import jwt, { type JwtPayload } from "jsonwebtoken"
export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/node_modules/')) {
        return new Response(null);
    }


    if (event.url.pathname !== "/") {
        const pcookie = event.cookies.get("passcode") || ""
        if (!pcookie) throw redirect(303, "/")

        const token = jwt.verify(pcookie, import.meta.env.VITE_SECRET) as JwtPayload
        const data = token?.data
        const passcode = data?.passcode

        if (passcode !== import.meta.env.VITE_PASSCODE) {
            throw redirect(303, "/")
        }

    }

    const response = await resolve(event);
    return response;
}
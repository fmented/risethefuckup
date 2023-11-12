import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/node_modules/')) {
        return new Response(null);
    }

    else if (event.url.pathname === "/") {
        const passcode = event.cookies.get("passcode")

        if (passcode === import.meta.env.VITE_PASSCODE) {
            return new Response(null, {
                status: 302,
                headers: new Headers({ Location: "/check-in" })
            })
        }
    }

    else if (!(event.url.pathname === "/")) {
        if (!event.cookies.get("passcode"))
            return new Response(null, {
                status: 302,
                headers: new Headers({ Location: "/" })
            })
    }

    const response = await resolve(event);
    return response;
}
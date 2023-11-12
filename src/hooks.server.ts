import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/node_modules/')) {
        return new Response('');
    }

    if (event.url.pathname === "/") {
        const passcode = event.cookies.get("passcode")

        if (passcode === import.meta.env.VITE_PASSCODE) {
            throw redirect(302, "/check-in")
        }
    }

    if (!(event.url.pathname === "/")) {
        if (!event.cookies.get("passcode"))
            throw redirect(302, "/")
    }

    const response = await resolve(event);
    return response;
}
export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/node_modules/')) {
        return new Response('');
    }

    const response = await resolve(event);
    return response;
}
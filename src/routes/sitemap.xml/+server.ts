import type { RequestHandler } from "@sveltejs/kit"

const links = [
    "",
    "ticket-order",
    "stats",
    "claim",
    "check-in"
]

const template = (s: string) => `<urlset xmlns="https://www.sitemaps.org/schemas/0.9" xmlns:xhtml="https://www.w3.org/1999/xhtml">
${links.map(i => {
    return `<url>
    <loc>${s}/${i}</loc>
    <lastmod>${(new Date()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    </url>`
}).join("")}
</urlset>`

export const GET: RequestHandler = ({ url }) => {

    return new Response(template(`${url.protocol}//${url.host}`), {
        headers: {
            "Content-Type": "text/xml"
        }
    })
}

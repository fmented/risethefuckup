import { model } from "../../serverstuff"

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    return {
        data: await model.ticket.findMany({ include: { Merch: { include: { ticket: true } } }, orderBy: { createdAt: "desc" }, cacheStrategy: { ttl: 60 } })
    }
}
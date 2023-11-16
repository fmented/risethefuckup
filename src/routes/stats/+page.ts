import type { Merch, Ticket } from "$lib"

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {

    const res = await fetch("/api/v1/stats")
    const data = await res.json()


    return {
        data: data.tickets as Array<Ticket & { Merch: Merch | null }>
    }
}
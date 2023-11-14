
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const ticket = await fetch("/api/v1/check", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ id: params.id })
    })

    const t = await ticket.json()

    return t
}
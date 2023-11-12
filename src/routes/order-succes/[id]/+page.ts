
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
    const merch = await fetch("/api/v1/check-merch", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ qr: params.id })
    })

    return await merch.json()
}
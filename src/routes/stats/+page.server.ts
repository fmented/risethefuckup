import { model } from "../../serverstuff"

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

    const data = await model.ticket.findMany({ include: { Merch: true }, orderBy: { createdAt: "desc" } })
    return {
        data: data.map(d => {
            const x = {
                qr: d.qr,
                name: d.name,
                email: d.email,
                id: d.id,

                Merch: !d.Merch
                    ? null
                    : {
                        qr: d.Merch.qr,
                        id: d.Merch.id,
                        name: d.Merch.name,
                        size: d.Merch.size,
                        ticketId: d.Merch.ticketId

                    }
            }
            return x
        })
    }
}
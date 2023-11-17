// import { dev } from "$app/environment"
// import type { Merch, Ticket } from "$lib"

// /** @type {import('./$types').PageLoad} */
// export async function load({ params, fetch }) {

//     const res = await fetch(dev ? "http://localhost:3000/stats" : `${import.meta.env.VITE_EMAIL_URL}/stats`, {
//         headers: {
//             "content-type": "application/json",
//             "no-cors": "true",
//         }
//     })
//     const data = await res.json() as {
//         data: Array<(Ticket & { Merch: Merch | null })>;
//         error: string | null;
//     }

//     console.log(data);

//     return {
//         data: data.data
//     }
// }
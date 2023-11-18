import { redirect } from '@sveltejs/kit'
import jwt, { type JwtPayload } from "jsonwebtoken"

/** @type {import('./$types').PageLoad} */
export async function load({ cookies, fetch, request }) {
    const pcode = cookies.get("passcode") || ""
    if (!pcode) return {}
    const token = jwt.verify(pcode, import.meta.env.VITE_SECRET) as JwtPayload
    const data = token?.data
    const passcode = data?.passcode

    if (passcode === import.meta.env.VITE_PASSCODE)
        throw redirect(301, "/stats")
    return {}
}

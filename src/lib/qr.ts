import { type Writable, writable } from "svelte/store";
import type { Merch, Ticket } from "@prisma/client"


class QR {
    #w: Worker | undefined
    constructor(w?: Worker) {
        this.#w = w
    }

    setWorker(w: Worker) {
        this.#w = w
    }

    async createQR(data: string): Promise<string> {
        return new Promise((res, rej) => {
            if (!this.#w) return rej(new Error("Worker is not initialized", { cause: "Worker is undefined" }))
            this.#w.postMessage(data)
            const w = this.#w


            function return_(ev: MessageEvent) {
                const data = ev.data as string
                w.removeEventListener("message", return_)
                res(data)
            }

            this.#w.addEventListener("message", return_)

        })

    }
}

export const qr = writable(new QR())

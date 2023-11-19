import { type Writable, writable } from "svelte/store";
import type { Merch, Ticket } from "@prisma/client"


class PDF {
    #w: Worker | undefined
    constructor(w?: Worker) {
        this.#w = w
    }

    setWorker(w: Worker) {
        this.#w = w
    }

    async createPDF(data: Ticket & { Merch: Merch | null }): Promise<File> {
        return new Promise((res, rej) => {
            if (!this.#w) return rej(new Error("Worker is not initialized", { cause: "Worker is undefined" }))
            this.#w.postMessage(data)
            const w = this.#w


            function return_(ev: MessageEvent) {
                const data = ev.data as File
                w.removeEventListener("message", return_)
                res(data)
            }

            this.#w.addEventListener("message", return_)

        })

    }
}

export const pdf = writable(new PDF())

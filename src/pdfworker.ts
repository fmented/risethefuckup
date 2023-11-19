/// <reference lib="webworker" />


import type { Merch, Ticket } from "@prisma/client"
import "./pdfkit.standalone.js"
import { generateReceipt, generateTicket } from "$lib"


async function getDb(version: number = 1): Promise<null | IDBDatabase> {
    const request = worker.indexedDB.open("pdf", version)

    return new Promise((res, rej) => {
        request.addEventListener("error", e => {
            res(null)
        })

        request.addEventListener("upgradeneeded", (ev) => {
            let db: IDBDatabase = (ev.target as IDBRequest).result
            const transaction = (ev.target as IDBRequest).transaction!;
            console.log("Object Store creation");
            if (transaction.objectStoreNames.contains("pdf")) {
                db.deleteObjectStore("pdf")
            }
            db.createObjectStore("pdf", {
                autoIncrement: true,
            })
            transaction.commit()
            transaction.addEventListener("complete", ev => {
                res((ev.target as IDBRequest).result)
            })
        })


        request.addEventListener("success", e => {
            res((e.target as IDBRequest).result)
        })

    })

}

async function getPdfFromDb(filename: string): Promise<Blob | null> {

    const db = await getDb()
    return new Promise((res, rej) => {
        if (db == null) return res(null)
        const transaction = db.transaction(["pdf"], "readonly")
        const req = transaction.objectStore("pdf").get(filename)
        req.addEventListener("success", e => {
            res((e.target as IDBRequest).result)
        })
        req.addEventListener("error", e => {
            res(null)
        })
    })

}


async function savePdfToDb(filename: string, data: Blob) {
    const db = await getDb()
    return new Promise((res, rej) => {
        if (db == null) return res(null)
        const transaction = db.transaction(["pdf"], "readwrite")
        const req = transaction.objectStore("pdf").add(data, filename)
        req.addEventListener("success", e => {
            transaction.commit()
            res((e.target as IDBRequest).result)
        })
        req.addEventListener("error", e => {
            console.log(e);
            res(null)
        })
    })

}

type T = Ticket & { Merch: Merch | null }
const worker = (self as unknown) as DedicatedWorkerGlobalScope & { PDFDocument: PDFKit.PDFDocument }


async function createPdf(data: T): Promise<Blob> {
    if (data.Merch) {
        return await generateReceipt({ ...(data.Merch), ticket: data }, worker.PDFDocument)
    }
    else {
        return await generateTicket(data, worker.PDFDocument)
    }
}


worker.addEventListener("message", async ev => {
    const data = ev.data as T
    const filename = `${data.name}_${data.id}.pdf`

    let blobflomdb = await getPdfFromDb(filename)
    if (blobflomdb) {
        console.log("PDF From DB");

        const file = new File([blobflomdb], filename, { type: "application/pdf" })
        return worker.postMessage(file)

    }

    const blob = await createPdf(data)
    console.log("New PDF Creation");

    const file = new File([blob], filename, { type: "application/pdf" })
    worker.postMessage(file)
    const s = await savePdfToDb(filename, blob)
    console.log("Saving " + s);


})

/// <reference lib="webworker" />
import QRCode from "qrcode-svg"


const worker = (self as unknown) as DedicatedWorkerGlobalScope & { PDFDocument: PDFKit.PDFDocument }


function createQr(qr: string): string {
    return new QRCode({
        content: qr,
        background: "#222",
        color: "#ED7",
        join: true,
        container: "svg-viewbox",
    }).svg()
}


worker.addEventListener("message", async ev => {
    const data = ev.data as string
    return worker.postMessage(createQr(data))
})

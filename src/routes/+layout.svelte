<script lang="ts">
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import pdfworker from "../pdfworker?worker";
    import qrworker from "../qrcodeworker?worker";
    import { pdf } from "$lib/pdf";
    import { qr } from "$lib/qr";

    onMount(() => {
        navigator.serviceWorker.register("/service-worker.js", {
            type: dev ? "module" : "classic",
        });

        const pdf_w = new pdfworker();
        $pdf.setWorker(pdf_w);

        const qr_w = new qrworker();
        $qr.setWorker(qr_w);
    });
</script>

<slot />

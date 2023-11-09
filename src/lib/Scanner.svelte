<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import {
        Html5QrcodeScanner,
        Html5QrcodeScanType,
        Html5QrcodeSupportedFormats,
    } from "html5-qrcode";
    import type { Html5QrcodeScanner as HType } from "html5-qrcode";
    import { browser } from "$app/environment";

    const d = createEventDispatcher();
    let el: HTMLElement;

    let html5QrcodeScanner: HType;

    async function onScanSuccess(decodedText: string) {
        d("scan", decodedText);

        if (1 !== html5QrcodeScanner.getState()) {
            html5QrcodeScanner.pause(true);
            html5QrcodeScanner.clear();
        }
    }

    onMount(() => {
        if (browser) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                el.id,
                {
                    fps: 10,
                    qrbox: 250,
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                },
                true
            );

            html5QrcodeScanner.render(onScanSuccess, undefined);
        }
    });
</script>

<div class="c">
    <div id="qr-reader" bind:this={el} />
</div>

<style>
    #qr-reader {
        z-index: 1;
        position: relative;
        border: 0 !important;
        width: 80vw;
        height: 80vh;
    }

    .c {
        height: 100%;
        display: grid;
        grid-template-rows: 1fr;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 2rem;
    }

    .c > div {
        height: 100%;
    }
</style>

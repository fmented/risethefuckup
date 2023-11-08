<script lang="ts">
    import { afterUpdate, createEventDispatcher, onMount } from "svelte";
    import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
    import type {
        Html5QrcodeScanner as HType,
    } from "html5-qrcode";

    export let text = "Masuk"

    const d = createEventDispatcher();
    let scanning = false;

    let html5QrcodeScanner: HType;

    async function onScanSuccess(
        decodedText: string,
    ) {
        d("scan", decodedText);

        if (1 !== html5QrcodeScanner.getState()) {
            html5QrcodeScanner.pause(true);
            html5QrcodeScanner.clear();
        }

        // scanning = false;
    }

    afterUpdate(() => {
        if (scanning) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: 250,
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_CAMERA,
                        Html5QrcodeScanType.SCAN_TYPE_FILE,
                    ],
                },
                false
            );

            html5QrcodeScanner.render(onScanSuccess, (e) => null);
        }
    });

    export function scan(){
        scanning = true
    }

    export function stop(){
        scanning = false
    }

</script>

<div class="c">
    <div>
        <strong>{text}</strong>
    </div>

    {#if scanning}
    <div id="qr-reader" />
    {/if}


</div>

    

    <style>
        #qr-reader{
            height: 100%;
            z-index: 1;
            position: relative;
            border: 0  !important;
        }

        .c{
            height: 100%;
            display: grid;
            grid-template-rows: auto 1fr;
            align-items: center;
            text-align: center;
            gap: 2rem;
        }

        .c > div{
            height: 100%;
        }

        strong{
            font-size: xx-large;
            text-align: center;
        }

    </style>
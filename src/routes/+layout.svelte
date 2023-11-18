<script lang="ts">
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import pdfkit from "$lib/pdfkit.standalone.js?raw";

    onMount(() => {
        navigator.serviceWorker.register("/service-worker.js", {
            type: dev ? "module" : "classic",
        });

        navigator.serviceWorker.ready.then((e) => {
            e.active?.postMessage("x");
        });
    });
</script>

<svelte:head>
    {@html `<script id="pdfkit">${pdfkit}</script>`}
</svelte:head>

<slot />

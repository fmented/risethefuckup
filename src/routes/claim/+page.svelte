<script lang="ts">
    import Scanner from "$lib/Scanner.svelte";
    import ResponseDisplayer from "$lib/MerchCheckDisplayer.svelte";
    import Header from "$lib/Header.svelte";
    import ErrorDisplayer from "$lib/ErrorDisplayer.svelte";
    import type { APIResponse, CheckReturn, Merch } from "$lib";
    import { slide } from "svelte/transition";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";

    let data: Merch | null | { error: string } = null;

    async function onScanSuccess(decodedText: string) {
        const res: { data: Merch | null; error: string } = await (
            await window.fetch(
                dev
                    ? `http://${$page.url.hostname}:8080/merch-get`
                    : `${import.meta.env.VITE_EMAIL_URL}/merch-get`,
                {
                    headers: {
                        "content-type": "application/json",
                        qr: decodedText,
                        "no-cors": "true",
                    },
                }
            )
        ).json();

        if (res.data) data = res.data;
        else {
            data = { error: "Unknown Qr Code" };
        }
    }

    async function ok(merch: Merch) {
        if (!merch.valid) return (data = null);

        await window.fetch(
            dev
                ? `http://${$page.url.hostname}:8080/merch-up`
                : `${import.meta.env.VITE_EMAIL_URL}/merch-up`,
            {
                headers: {
                    "content-type": "application/json",
                    qr: merch.qr,
                    "no-cors": "true",
                },
            }
        );

        data = null;
    }

    async function buttonCallback() {
        if (data !== null && "qr" in data) return ok(data);
        data = null;
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        {#if data}
            {#if "qr" in data}
                <ResponseDisplayer merch={data} />
            {:else}
                <ErrorDisplayer {data} />
            {/if}
        {:else}
            <Scanner on:scan={(e) => onScanSuccess(e.detail)} />
        {/if}
    </div>

    {#if data}
        <button
            transition:slide={{ delay: 100 }}
            on:click={buttonCallback}
            class="info">{"OK"}</button
        >
    {/if}
</div>

<style>
    .fuck {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        color: #ed7;
        background-color: #555;
    }

    .fuck > .main {
        width: 100vw;
        height: 100%;
        padding: 2em;
        background: url($lib/favicon.png);
        background-size: cover;
        background-position-x: 50%;
        background-repeat: no-repeat;
    }

    button {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
    }

    button {
        font-size: 16px;
        padding: 2em;
    }
</style>

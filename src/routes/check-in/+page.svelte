<script lang="ts">
    import Scanner from "$lib/Scanner.svelte";
    import ResponseDisplayer from "$lib/TicketCheckDisplayer.svelte";
    import Header from "$lib/Header.svelte";
    import ErrorDisplayer from "$lib/ErrorDisplayer.svelte";
    import type { APIResponse, CheckReturn, Ticket } from "$lib";
    import { slide } from "svelte/transition";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";

    let data: Ticket | null | { error: string } = null;

    async function onScanSuccess(decodedText: string) {
        const res: { data: Ticket | null; error: string } = await (
            await window.fetch(
                dev
                    ? `http://${$page.url.hostname}:3000/ticket-get`
                    : `${import.meta.env.VITE_EMAIL_URL}/ticket-get`,
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
        else data = { error: "Unknown Qr Code" };
    }

    async function ok(ticket: Ticket) {
        if (!ticket.valid) return (data = null);

        await window.fetch(
            dev
                ? `http://${$page.url.hostname}:3000/ticket-up`
                : `${import.meta.env.VITE_EMAIL_URL}/ticket-up`,
            {
                headers: {
                    "content-type": "application/json",
                    qr: ticket.qr,
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
            {#if "valid" in data}
                <ResponseDisplayer ticket={data} />
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
            class="info">{data === null ? "Scan" : "OK"}</button
        >
    {/if}
</div>

<style>
    .fuck {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        color: #ed7;
        background-color: #222;
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

<script lang="ts">
    import ResponseDisplayer from "$lib/TicketCheckDisplayer.svelte";
    import Header from "$lib/Header.svelte";
    import ErrorDisplayer from "$lib/ErrorDisplayer.svelte";
    import type { Ticket } from "$lib";

    export let data: Ticket | null = null;

    async function buttonCallback() {
        if (!data) return;
        const link = document.createElement("a");
        link.setAttribute("download", "ticket " + data.name + ".pdf");
        link.setAttribute("href", "/api/v1/ticketpdf/" + data.qr);
        link.click();
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        {#if data !== null && "qr" in data}
            <div class="h1">
                <strong>E-Ticket Rise The Fuck Up</strong>
            </div>
            <ResponseDisplayer ticket={data} />
            <div class="note">
                <small>[Note]</small>
                <br />
                <small>- Simpan kode QR ini untuk memasuki venue.</small>
                <br />
                <small>- Satu tiket berlaku untuk satu orang.</small>
                <br />
                <small
                    >- Jangan berikan kode QR ini kepada siapapun sebelum
                    memasuki venue.</small
                >
                <br />
                <small>- Satu tiket hanya berlaku untuk satu kali masuk.</small>
            </div>
        {:else}
            <ErrorDisplayer data={{ error: "invalid QRCode" }} />
        {/if}
    </div>

    {#if data}
        <button on:click={buttonCallback} class="info">Download PDF</button>
    {/if}
</div>

<style>
    .fuck {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        color: #ed7;
        background: url($lib/favicon2.png);
        background: #555;
    }

    .h1,
    .note {
        display: none;
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

    small {
        font-size: 24px;
    }

    @media print {
        * {
            color: black;
        }

        button {
            display: none;
        }

        .h1 {
            display: grid;
            place-items: center;
            text-align: center;
            margin-bottom: 2rem;
        }

        strong {
            font-size: 36px;
            color: black;
        }

        .note {
            color: black;
            display: initial;
            background-color: #555;
        }

        .fuck {
            background: url($lib/favicon2.png);
            background-position-x: 50%;
            background-position-y: 65px;
            background-repeat: no-repeat;
            height: 100vh;
            background-size: cover;
        }

        .fuck > .main {
            background: #555;
        }

        :global(body) {
            background-color: #555;
        }
    }
</style>

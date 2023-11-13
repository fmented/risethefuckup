<script lang="ts">
    import ResponseDisplayer from "$lib/MerchCheckDisplayer.svelte";
    import Header from "$lib/Header.svelte";
    import ErrorDisplayer from "$lib/ErrorDisplayer.svelte";
    import type { Merch } from "$lib";

    export let data: Merch | null = null;

    async function buttonCallback() {
        if (!data) return;
        window.location.pathname = "/api/v1/merchpdf" + data.qr;
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        {#if data && "qr" in data}
            <div class="h1">
                <strong>Merch Redeem QRCode</strong>
            </div>
            <ResponseDisplayer merch={data} />
            <div class="note">
                <small>[Note]</small>
                <br />
                <small>- Simpan kode QR ini untuk penukaran merchandise.</small>
                <br />
                <small
                    >- Jangan berikan kode QR ini kepada siapapun sebelum
                    menukarkan merchandise.</small
                >
                <br />
                <small>- Ukuran yang sudah dipesan tidak dapat dirubah.</small>
                <br />
                <small
                    >- Penukaran merchandise bisa dilakukan di venue atau bisa
                    juga menghubungi CP kami.</small
                >
            </div>
        {:else}
            <ErrorDisplayer data={{ error: "invalid QRCode" }} />
        {/if}
    </div>

    {#if data}
        <button on:click={buttonCallback} class="info">{"PRINT"}</button>
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

    @media print {
        button {
            display: none;
        }

        small {
            font-size: 24px;
        }

        .h1 {
            display: grid;
            place-items: center;
            text-align: center;
            margin-bottom: 2rem;
        }

        :global(body) {
            background-color: #555;
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
    }
</style>

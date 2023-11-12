<script lang="ts">
    import type { Merch } from "./index.js";
    import QRCode from "qrcode-svg";
    import favicon from "$lib/favicon.png";

    export let merch: Merch;

    const f = Intl.DateTimeFormat("id", {
        dateStyle: "long",
        timeZone: "Asia/Jakarta",
        timeStyle: "short",
    });

    export let inverse = false;

    $: qr = merch?.qr;

    $: valid = merch?.valid;

    $: name = merch?.name;

    $: size = merch?.size;

    $: claimedAt = merch?.claimedAt || 0;
</script>

<form>
    {#if qr !== undefined}
        <div class="q">
            {@html new QRCode({
                content: qr,
                background: "#222",
                color: "#ED7",
                join: true,
                container: "svg-viewbox",
            }).svg()}

            <img src={favicon} alt="Logo" width="300" />
        </div>
    {/if}

    {#if valid != undefined}
        <div class="noprint">
            <label for="status">Status</label>
            <input
                type="text"
                value={valid ? "Unredeemed" : `Redeemed`}
                disabled
                id="status"
                class:error={!inverse ? !valid : valid}
                class:ok={!inverse ? valid : !valid}
            />
        </div>
    {/if}

    {#if name}
        <div>
            <label for="name">Nama</label>
            <input type="text" value={`${name}`} disabled id="name" />
        </div>
    {/if}

    {#if size}
        <div>
            <label for="size">Size</label>
            <input type="text" value={`${size}`} disabled id="size" />
        </div>
    {/if}

    {#if claimedAt !== null}
        <div>
            <label for="date">Used </label>
            <input
                type="datetime"
                value={f.format(new Date(claimedAt))}
                disabled
                id="date"
            />
        </div>
    {/if}
</form>

<style>
    input {
        width: calc(calc(100vw - 18ch) - 2em);
        padding: 1em;
        border-radius: 0.25em;
        font-weight: bold;
        font-size: 16px;
        color: black;
    }

    img {
        display: none;
    }

    div {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
    }

    .q {
        justify-content: center;
    }

    form {
        height: 100%;
        font-size: large;
        display: flex;
        flex-direction: column;
        gap: 2em;
        background-color: #555;
        padding-bottom: 4rem;
    }

    @media print {
        .noprint {
            display: none;
        }

        label {
            color: black;
        }

        form {
            height: max-content;
        }

        .q {
            justify-content: space-around;
        }

        img {
            display: initial;
        }
    }
</style>

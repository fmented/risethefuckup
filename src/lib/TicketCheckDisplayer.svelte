<script lang="ts">
    import type { Ticket } from "$lib";
    import QRCode from "qrcode-svg";
    import ETicket from "$lib/ETicket.svelte";

    export let ticket: Ticket;

    const f = Intl.DateTimeFormat("id", {
        dateStyle: "long",
        timeZone: "Asia/Jakarta",
        timeStyle: "short",
    });

    export let inverse = false;

    $: qr = ticket?.qr;
    $: valid = ticket?.valid;
    $: name = ticket?.name;
    $: checkInAt = ticket?.checkInAt;
</script>

<form>
    {#if qr !== undefined}
        <div class="q">
            <ETicket {qr} />
        </div>

        <div class="noprint">
            {@html new QRCode({
                content: qr,
                background: "#222",
                color: "#ED7",
                join: true,
                container: "svg-viewbox",
            }).svg()}
        </div>
    {/if}

    {#if valid != undefined}
        <div class="noprint">
            <label for="status">Status</label>
            <input
                type="text"
                value={valid ? "Unused" : `Used`}
                disabled
                id="status"
                class:error={!inverse ? !valid : valid}
                class:ok={!inverse ? valid : !valid}
            />
        </div>
    {/if}

    {#if name != undefined}
        <div>
            <label for="name">Name</label>
            <input type="text" value={name} disabled id="name" />
        </div>
    {/if}

    {#if checkInAt !== null}
        <div>
            <label for="stadatetus">Used At</label>
            <input
                type="datetime"
                value={f.format(new Date(checkInAt))}
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
        font-family: Verdana, Geneva, Tahoma, sans-serif;
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
        display: none;
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
    label {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
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
            display: flex;
            justify-content: center;
        }
    }
</style>

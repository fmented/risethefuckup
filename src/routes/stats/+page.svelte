<script lang="ts">
    import type { Merch, Ticket } from "$lib";
    import Header from "$lib/Header.svelte";
    import { onMount } from "svelte";
    import { generateReceipt, generateTicket } from "$lib";
    import FileSaver from "file-saver";

    function blob2uri(b: Blob): Promise<string> {
        return new Promise((res) => {
            const reader = new FileReader();
            reader.onloadend = function () {
                var base64data = reader.result;
                res(base64data as string);
            };
            reader.readAsDataURL(b);
        });
    }

    interface GW {
        PDFDocument: PDFKit.PDFDocument;
    }

    let w: GW & typeof window;
    let pdf: PDFKit.PDFDocument;

    let loading = false;

    let text: string = "";

    onMount(() => {
        w = window as GW & typeof window;
        pdf = w.PDFDocument;
    });

    export let data: {
        tickets: (Ticket & { Merch: (Merch & { ticket: Ticket }) | null })[];
    } = {
        tickets: [],
    };

    async function click(d: (typeof data)["tickets"][0]) {
        loading = true;
        text = "Preparing PDF for download";
        let blob = d.Merch
            ? await generateReceipt({ ...d.Merch, ticket: d }, pdf)
            : await generateTicket(d, pdf);

        text = "Download is starting";
        FileSaver.saveAs(blob, `${d.name}_${d.id}.pdf`, { autoBom: false });
        setTimeout(() => {
            loading = false;
        }, 1000);
    }

    async function sendEmail(
        data: Ticket & { Merch: (Merch & { ticket: Ticket }) | null },
        pdf: string
    ) {
        return await (
            await fetch(
                data.Merch
                    ? "/api/v1/bundlingpdf/" + data.id + "/send"
                    : `/api/v1/ticketpdf/` + data.id + "/send",
                {
                    body: JSON.stringify({
                        name: data.name,
                        to: data.email,
                        pdf: pdf,
                    }),
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                }
            )
        ).json();
    }

    async function resend(d: (typeof data)["tickets"][0]) {
        loading = true;
        text = "Preparing PDF";
        const blob = d.Merch
            ? await generateReceipt({ ...d.Merch, ticket: d }, pdf)
            : await generateTicket(d, pdf);
        const uri = await blob2uri(blob);

        text = "Re-sending PDF to " + d.email;

        const { status } = await sendEmail(d, uri);

        if (status && status == "Success") {
            text = "Done re-sending PDF";
        } else {
            text = "Couldn't re-send PDF";
        }

        setTimeout(() => {
            loading = false;
        }, 1000);
    }

    const f = Intl.DateTimeFormat("id", {
        dateStyle: "short",
        timeZone: "Asia/Jakarta",
        timeStyle: "short",
    });
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <!-- <div>
            <h1>Bundling</h1>
            <small>{data?.merchs?.length || 0} Rows</small>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Redeemed At</th>
                        <th>Valid</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data?.merchs || [] as r}
                        <tr>
                            <td
                                ><a href="/api/v1/bundlingpdf/{r.id}">{r.id}</a
                                ></td
                            >
                            <td>{r.name}</td>
                            <td>{r.size}</td>
                            <td
                                >{r.claimedAt
                                    ? f.format(new Date(r.claimedAt))
                                    : "-"}</td
                            >
                            <td>{r.valid ? "✔️" : "❌"}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div> -->
        <div>
            <h1>Ticket</h1>
            <small>{data?.tickets?.length || 0} Rows</small>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Merch</th>
                        <!-- <th>Valid</th> -->
                    </tr>
                </thead>
                <tbody>
                    {#each data.tickets || [] as r}
                        <tr>
                            <td on:contextmenu|preventDefault={() => click(r)}>
                                <span>{r.id}</span></td
                            >
                            <td>{r.name}</td>
                            <td
                                on:contextmenu|preventDefault={() => resend(r)}
                                style="word-break: break-all;"
                                ><span>{r.email}</span></td
                            >
                            <td>{r.Merch?.size ? r.Merch.size : "-"}</td>
                            <!-- <td>{r.valid ? "✔️" : "❌"}</td> -->
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- {#if data}
        <button class="info">{"PRINT"}</button>
    {/if} -->
</div>

{#if loading}
    <div class="overlay">
        <strong>{text}</strong>
    </div>
{/if}

<style>
    td,
    th {
        border: 2px solid #ed7;
        text-align: center;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    td {
        max-width: calc(99vw - 2rem);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: smaller;
    }

    small {
        margin-bottom: 0.5rem;
    }

    span {
        cursor: pointer;
        user-select: none;
    }

    td {
        padding: 0.5em;
    }

    tr > td:first-of-type {
        text-align: left;
        word-break: break-all;
    }

    table {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
    }

    .fuck {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        color: #ed7;
        background-color: #222;
        text-decoration: none;
    }

    .fuck > .main {
        width: 100vw;
        display: flex;
        flex-direction: column;
        background-color: #222;

        gap: 2rem;
        height: 100%;
        padding: 2em;
        background-size: cover;
        background-position-x: 50%;
        background-repeat: no-repeat;
        padding-bottom: 6rem;
    }

    .overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        background-color: #222a;
        color: white;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    .overlay > strong {
        opacity: 1;
    }

    /* button {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
    }

    button {
        font-size: 16px;
        padding: 2em;
    } */

    @media print {
        * {
            color: black;
        }

        th,
        td {
            border: 2px solid black;
        }

        /* button {
            display: none;
        } */
    }
</style>

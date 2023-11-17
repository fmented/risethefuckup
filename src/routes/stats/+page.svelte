<script lang="ts">
    import type { Merch, Ticket } from "$lib";
    import Header from "$lib/Header.svelte";
    import { onMount } from "svelte";
    import { generateReceipt, generateTicket } from "$lib";
    import type { PageData } from "./$types";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";

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

    let a: HTMLAnchorElement[] = [];

    function noaction(e: Event) {
        e.preventDefault();
    }

    let data: Array<Ticket & { Merch: Merch | null }> = [];

    onMount(async () => {
        w = window as GW & typeof window;
        pdf = w.PDFDocument;
        a.forEach((_a) => {
            _a.addEventListener("click", noaction);
        });

        const res = await window.fetch(
            dev
                ? `http://${$page.url.hostname}:3000/stats`
                : `${import.meta.env.VITE_EMAIL_URL}/stats`,
            {
                headers: {
                    "content-type": "application/json",
                    "no-cors": "true",
                },
            }
        );
        const json = (await res.json()) as {
            data: Array<Ticket & { Merch: Merch | null }>;
            error: string | null;
        };

        if (json.data) {
            data = json.data;
        } else {
            console.log(json);
        }
    });

    type Unwrap<A> = A extends unknown[] ? Unwrap<A[number]> : A;

    async function click(d: Unwrap<typeof data>, i: number) {
        pdf = w.PDFDocument;
        if (pdf == undefined) return;
        loading = true;
        text = "Preparing PDF for download";
        let blob = d.Merch
            ? await generateReceipt({ ...d.Merch, ticket: d }, pdf)
            : await generateTicket(d, pdf);

        let uri = await blob2uri(blob);

        navigator.serviceWorker.ready.then((reg) => {
            reg.active?.postMessage(
                JSON.stringify({ cmd: "download-pdf", data: uri })
            );
            navigator.serviceWorker.addEventListener("message", (e) => {
                if (e.data == "pdf-ready") {
                    a[i].removeEventListener("click", noaction);
                    a[i].click();
                    a[i].addEventListener("click", noaction);
                    text = "Download is starting";
                    setTimeout(() => {
                        loading = false;
                    }, 1000);
                }
            });
        });
    }

    async function sendEmail(ticket: Unwrap<typeof data>, pdf: ArrayBuffer) {
        return await (
            await window.fetch(
                ticket.Merch
                    ? `${
                          dev
                              ? `http://${$page.url.hostname}:3000`
                              : import.meta.env.VITE_EMAIL_URL
                      }/bundlingpdf`
                    : `${
                          dev
                              ? `http://${$page.url.hostname}:3000`
                              : import.meta.env.VITE_EMAIL_URL
                      }/ticketpdf`,
                {
                    body: pdf,
                    method: "POST",
                    headers: {
                        To: ticket.email,
                        Name: ticket.name,
                        "Content-Type": "application/octet-stream",
                        "no-cors": "true",
                        "Access-Control-Request-Method": "POST",
                    },
                }
            )
        ).json();
    }

    async function resend(d: Unwrap<typeof data>) {
        if (pdf == undefined) return;
        loading = true;
        text = "Preparing PDF";
        const blob = d.Merch
            ? await generateReceipt({ ...d.Merch, ticket: d }, pdf)
            : await generateTicket(d, pdf);

        text = "Re-sending PDF to " + d.email;

        const { status } = await sendEmail(d, await blob.arrayBuffer());

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
        <div>
            <h1>Ticket</h1>
            {#if data.length == 0}
                <strong>Loading Data....</strong>
            {:else}
                <small>{data?.length || 0} Rows</small>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Merch</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data as r, i}
                            <tr>
                                <td
                                    on:contextmenu|preventDefault={() =>
                                        click(r, i)}
                                >
                                    <a
                                        bind:this={a[i]}
                                        href="/{r.name}_{r.id}.pdf">{r.id}</a
                                    ></td
                                >
                                <td>{r.name}</td>
                                <td
                                    on:contextmenu|preventDefault={() =>
                                        resend(r)}
                                    style="word-break: break-all;"
                                    ><span>{r.email}</span></td
                                >
                                <td>{r.Merch?.size ? r.Merch.size : "-"}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    </div>
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
        user-select: none;
    }

    td {
        max-width: calc(99vw - 2rem);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: smaller;
    }

    a {
        text-decoration: none;
        color: #ed7;
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

<script lang="ts">
    import type { Merch, Ticket } from "$lib";
    import Header from "$lib/Header.svelte";
    import { onMount } from "svelte";
    import { generateReceipt, generateTicket } from "$lib";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";
    import { supported, fileSave } from "browser-fs-access";
    import { canShare, share } from "$lib/share";
    import { fade, fly, slide } from "svelte/transition";

    let trigger: HTMLElement;

    async function download(
        ticket: (Ticket & { Merch: Merch | null }) | null,
        e: Event
    ) {
        if (!pdf || !ticket) return;
        loading = true;
        const target = e.target as HTMLTableColElement;
        target.parentElement!.classList.add("info");
        const filename = `${ticket.name}_${ticket.id}.pdf`;
        text = "Preparing PDF for download";
        let blob: Blob;

        if (ticket.Merch) {
            try {
                blob = await generateReceipt(
                    { ...ticket.Merch, ticket: ticket },
                    pdf
                );
            } catch (error) {
                text = (error as Error).message;

                setTimeout(() => {
                    loading = false;
                }, 1000);
                return;
            }
        } else {
            try {
                blob = await generateTicket(ticket, pdf);
            } catch (error) {
                text = (error as Error).message;

                setTimeout(() => {
                    loading = false;
                }, 1000);
                return;
            }
        }

        async function _d() {
            trigger.removeEventListener("click", _d);
            if (canShare({ blob, filename })) {
                text = "Sharing PDF";
                return share({ blob, filename })
                    ?.then((_) => {
                        loading = false;
                        target.parentElement!.classList.remove("info");
                    })
                    .catch((err) => {
                        text = err.message;
                        setTimeout(() => {
                            loading = false;
                        }, 1000);
                    })
                    .finally(() =>
                        target.parentElement!.classList.remove("info")
                    );
            }

            if (supported) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [
                            {
                                accept: {
                                    "application/pdf": [".pdf"],
                                },
                                description: "Document",
                            },
                        ],
                    });

                    text = "Download is starting";
                    const wstream = await handle.createWritable();
                    await wstream.write(blob);
                    await wstream.close();

                    text = "Download is completed";

                    setTimeout(() => {
                        loading = false;
                    }, 1000);
                } catch (error) {
                    loading = false;
                }
            } else {
                await fileSave(blob, {
                    fileName: filename,
                    extensions: [".pdf"],
                });
                loading = false;
            }
            target.parentElement!.classList.remove("info");
        }

        trigger.addEventListener("click", _d);
        text = "Click here to download";
    }

    interface GW {
        PDFDocument: PDFKit.PDFDocument;
    }

    // function action(
    //     node: HTMLElement,
    //     { ticket }: { ticket: (Ticket & { Merch: Merch | null }) | null }
    // ) {
    //     node.addEventListener("click", (e) => download(ticket, e));

    //     return {
    //         destroy() {
    //             node.removeEventListener("click", (e) => download(ticket, e));
    //         },
    //     };
    // }

    let w: GW & typeof window;
    let pdf: PDFKit.PDFDocument;

    let loading = false;

    let text: string = "";

    let data: Array<Ticket & { Merch: Merch | null }> | null = null;

    onMount(async () => {
        w = window as GW & typeof window;
        pdf = w.PDFDocument;

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
            data = json.data.filter((i) => i.name != "OTS");
        } else {
            console.log(json);
        }
    });

    type Unwrap<A> = A extends unknown[] ? Unwrap<A[number]> : A;

    async function sendEmail(
        ticket: Unwrap<Ticket & { Merch: Merch | null }>,
        pdf: ArrayBuffer
    ) {
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
                        "Content-Type": "application/pdf",
                        "no-cors": "true",
                        "Access-Control-Request-Method": "POST",
                    },
                }
            )
        ).json();
    }

    async function resend(d: Unwrap<typeof data>, e: Event) {
        if (pdf == undefined || !d) return;
        loading = true;
        text = "Preparing PDF";
        const target = e.target as HTMLSpanElement;
        target.parentElement!.classList.add("info");

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
            target.parentElement!.classList.remove("info");
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
        <div class="slide">
            <h1>Ticket</h1>
            {#if !data}
                <div class="min">
                    <strong> Fetching Data.... </strong>
                </div>
            {:else if data.length == 0}
                <div class="min" style="animation-delay: 400ms;" />
                <strong> {"Data Is Empty :("} </strong>
            {:else}
                <div class="slide">
                    <strong>{data?.length || 0} Rows</strong>
                </div>
                <table class="tick">
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
                                <td>
                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                    <span
                                        on:contextmenu|preventDefault|self={(
                                            e
                                        ) => download(r, e)}
                                    >
                                        {r.id.split("-")[0]}</span
                                    ></td
                                >
                                <td>
                                    <span>
                                        {r.name}
                                    </span>
                                </td>
                                <td style="word-break: break-all;">
                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                    <span
                                        on:contextmenu|preventDefault|self={(
                                            e
                                        ) => resend(r, e)}>{r.email}</span
                                    ></td
                                >
                                <td>
                                    <span>
                                        {r.Merch?.size ? r.Merch.size : "-"}
                                    </span>
                                </td>
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
        <strong bind:this={trigger}>{text}</strong>
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
        max-width: calc(24vw - 2rem);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: smaller;
    }

    strong,
    h1 {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        user-select: none;
    }

    span {
        cursor: pointer;
        user-select: none;
        margin-inline: 0.25rem;
        font-size: x-small;
    }

    td {
        height: 34px;
        margin: 0;
        padding: 0;
    }

    tr > td:first-of-type {
        /* text-align: left; */
        word-break: break-all;
        /* max-width: calc(20vw - 2rem); */
    }

    table {
        table-layout: auto;
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
        padding: 0.5em;
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

    @keyframes min {
        0% {
            transform: translateY(100vh);
        }
        100% {
            transform: translateY(0);
        }
    }

    .min {
        animation-name: min;
        animation-duration: 1000ms;
        animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
    }

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

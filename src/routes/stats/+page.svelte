<script lang="ts">
    import type { Merch, Ticket } from "$lib";
    import Header from "$lib/Header.svelte";
    import { onMount } from "svelte";
    import { generateReceipt, generateTicket } from "$lib";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";
    import { supported, fileSave } from "browser-fs-access";
    import { canShare, share } from "$lib/share";
    import { flip } from "svelte/animate";
    // import { fade, fly, slide } from "svelte/transition";
    import Spinner from "$lib/Spinner.svelte";
    let trigger: HTMLElement;
    let loading_text = "Fetching data....";
    let processing = false;

    async function download(
        ticket: (Ticket & { Merch: Merch | null }) | null,
        e: Event
    ) {
        if (!pdf || !ticket) return;
        loading = true;
        processing = true;
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

        processing = false;

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
                    .finally(() => {
                        target.parentElement!.classList.remove("info");
                        trigger.style.textDecoration = "";
                    });
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
            trigger.style.textDecoration = "";
        }

        trigger.addEventListener("click", _d);
        trigger.style.textDecoration = "underline";
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

    type D = Ticket & { Merch: Merch | null };

    let data: Array<D> | null = null;

    function sort(prop: "Merch" | "id" | "name" | "email") {
        return (a: D, b: D) => {
            const x =
                prop == "Merch"
                    ? a.Merch?.size.toLowerCase() || "-"
                    : a[prop].toLowerCase();
            const y =
                prop == "Merch"
                    ? b.Merch?.size.toLowerCase() || "-"
                    : b[prop].toLowerCase();
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        };
    }

    function sortReverse(prop: "Merch" | "id" | "name" | "email") {
        return (a: D, b: D) => {
            const y =
                prop == "Merch"
                    ? a.Merch?.size.toLowerCase() || "-"
                    : a[prop].toLowerCase();
            const x =
                prop == "Merch"
                    ? b.Merch?.size.toLowerCase() || "-"
                    : b[prop].toLowerCase();
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        };
    }

    onMount(async () => {
        w = window as GW & typeof window;
        pdf = w.PDFDocument;
        try {
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
                // .filter((i) => i.name != "OTS");

                if (data && data.length == 0) loading_text = "Data is empty :(";
            }
        } catch (error) {
            loading_text = "Couldn't load the data :(";
            console.clear();
        }
    });

    const th = [0, 0, 0, 0];

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
        processing = true;
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
            processing = false;
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
            {#if !data || !data.length}
                <div class="min">
                    <strong> {loading_text} </strong>
                </div>
            {:else}
                <div class="tick">
                    <strong>{data?.length || 0} Rows</strong>
                </div>
                <table class="slide">
                    <thead>
                        <tr>
                            <th
                                on:click={(_) => {
                                    if (!data || !data.length) return;
                                    data.sort(
                                        th[0] % 2 == 1
                                            ? sort("id")
                                            : sortReverse("id")
                                    );
                                    th[0]++;
                                    data = data;
                                }}>ID</th
                            >
                            <th
                                on:click={(_) => {
                                    if (!data || !data.length) return;
                                    data.sort(
                                        th[1] % 2 == 1
                                            ? sort("name")
                                            : sortReverse("name")
                                    );
                                    th[1]++;
                                    data = data;
                                }}>Name</th
                            >
                            <th
                                on:click={(_) => {
                                    if (!data || !data.length) return;
                                    data.sort(
                                        th[2] % 2 == 1
                                            ? sort("email")
                                            : sortReverse("email")
                                    );
                                    th[2]++;
                                    data = data;
                                }}>Email</th
                            >
                            <th
                                on:click={(_) => {
                                    if (!data || !data.length) return;
                                    data.sort(
                                        th[3] % 2 == 1
                                            ? sort("Merch")
                                            : sortReverse("Merch")
                                    );
                                    th[3]++;
                                    data = data;
                                }}>Merch</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each data as r, i (r)}
                            <tr
                                animate:flip={{
                                    duration: 300 + 30 * i,
                                    delay: 20 * i,
                                }}
                            >
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
    <div class="overlay" class:processing>
        {#if processing}
            <Spinner />
        {/if}
        <strong bind:this={trigger} style="cursor: pointer;">{text}</strong>
    </div>
{/if}

<style>
    td,
    th {
        border: 2px solid #ed7;
        text-align: center;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        user-select: none;
        cursor: pointer;
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

    .processing {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
</style>

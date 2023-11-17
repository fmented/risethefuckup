<script lang="ts">
    import type { Merch, Ticket } from "@prisma/client";
    import Header from "$lib/Header.svelte";
    import { slide } from "svelte/transition";
    import { generateReceipt, generateTicket } from "$lib";
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    interface GW {
        PDFDocument: PDFKit.PDFDocument;
        SVGO: { optimize: (s: string) => string };
    }

    let w: GW & typeof window;
    let pdf: PDFKit.PDFDocument;

    onMount(() => {
        w = window as GW & typeof window;
        pdf = w.PDFDocument;
    });

    let name = "";
    let bundling = false;
    let size = "";
    let email = "";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    let messages: string[] = [];

    let loading = false;
    let fillename = "";

    let download: RetryButton = {
        show: false,
        callback: async function () {
            if (!fillename) return;
            window.location.pathname = `/download-pdf`;
        },
    };
    let process = "";

    type RetryButton = {
        show: boolean;
        callback: () => Promise<void>;
    };

    let retryCreate: RetryButton | null = null;
    let retrySend: RetryButton | null = null;

    $: good = bundling ? name && size && email : name && email;

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

    async function sendEmail(
        data:
            | (Merch & {
                  valid: boolean;
                  ticket: Ticket & {
                      valid: boolean;
                      name: string | undefined;
                      Merch: Merch;
                  };
              })
            | (Ticket & { valid: boolean; name: string }),
        pdf: ArrayBufferLike
    ) {
        return await (
            await fetch(
                "ticketId" in data
                    ? `${
                          dev
                              ? "http://localhost:8080"
                              : import.meta.env.VITE_EMAIL_URL
                      }/bundlingpdf`
                    : `${
                          dev
                              ? "http://localhost:8080"
                              : import.meta.env.VITE_EMAIL_URL
                      }/ticketpdf`,
                {
                    body: pdf,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/pdf",
                        To: email,
                        Name: name,
                        "no-cors": "true",
                        "Access-Control-Request-Method": "POST",
                    },
                }
            )
        ).json();
    }

    async function order() {
        if (!good) return;
        pdf = w.PDFDocument;
        if (pdf == undefined) return;
        messages = [];
        loading = true;
        process = "Creating Data";

        try {
            const data:
                | (Merch & {
                      valid: boolean;
                      ticket: Ticket & {
                          valid: boolean;
                          name: string | undefined;
                          Merch: Merch;
                      };
                  })
                | (Ticket & { valid: boolean; name: string })
                | { error: string } = await (
                await fetch(
                    bundling
                        ? "/api/v1/order-bundling"
                        : `/api/v1/order-ticket`,
                    {
                        body: JSON.stringify({
                            name,
                            size,
                            email,
                        }),
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                    }
                )
            ).json();

            messages = [
                ...messages,
                "error" in data
                    ? "Error when creating data"
                    : "Done creating data",
            ];

            if ("error" in data) return;

            process = "Generating PDF";

            let blob: Blob;
            let _pdf: ArrayBufferLike;

            if ("ticketId" in data && typeof data.name === "string") {
                blob = await generateReceipt(data, pdf);
                _pdf = await blob.arrayBuffer();
            } else {
                blob = await generateTicket(data, pdf);
                _pdf = await blob.arrayBuffer();
                console.log(await blob2uri(blob));
            }

            messages = [
                ...messages,
                _pdf == undefined
                    ? "Error when generating PDF"
                    : "Done generating pdf",
            ];

            process = "Sending PDF";

            fillename =
                "ticketId" in data
                    ? `${name}_${data.ticketId}`
                    : `${name}_${data.id}`;

            let res: { status: string } | undefined = await sendEmail(
                data,
                _pdf
            );

            messages = [
                ...messages,
                res && res.status == "Failed"
                    ? "Error when sending PDF"
                    : "Done sending pdf",
            ];

            if (res?.status == "Failed") {
                retrySend = {
                    show: true,
                    callback: async function () {
                        const msg = messages;
                        msg.pop();
                        messages = msg;
                        res = await sendEmail(data, _pdf);
                        if (res?.status != "Failed") {
                            retrySend = null;
                        }
                    },
                };
            }

            navigator.serviceWorker.ready.then(async (reg) => {
                reg.active?.postMessage(
                    JSON.stringify({
                        cmd: "download-pdf",
                        data: await blob2uri(blob),
                    })
                );

                navigator.serviceWorker.addEventListener("message", (e) => {
                    if (e.data == "pdf-ready") {
                        download = { ...download, show: true };
                    }
                });
            });
        } catch (error) {
            messages = [...messages, "Coudn't Create Order"];
            retryCreate = { show: true, callback: order };
        }

        process = "";
        retryCreate = null;
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form>
            {#if loading}
                {#each messages as e, i}
                    <div class="in">
                        <label for="msg-{i}">Status</label>
                        <input type="text" readonly value={e} id="msg-{i}" />
                    </div>
                {/each}
                {#if process}
                    <div class="in">
                        <label for="process">Process</label>
                        <input
                            type="text"
                            readonly
                            value={process}
                            id="process"
                        />
                    </div>
                {/if}
                {#if download.show}
                    <div class="in" id="download-button">
                        <a id="download" href="{fillename}.pdf" class="info"
                            >Download PDF file</a
                        >
                    </div>
                {/if}
            {:else}
                <div class="in">
                    <label for="name">Name</label>
                    <input type="text" bind:value={name} id="name" />
                </div>
                <div class="in">
                    <label for="email">Email</label>
                    <input type="text" bind:value={email} id="email" />
                </div>
                <div class="cb">
                    <label for="bundling">Bundling</label>
                    <input
                        type="checkbox"
                        bind:checked={bundling}
                        id="bundling"
                    />
                </div>
                {#if bundling}
                    <div class="in">
                        <label for="size">Size</label>
                        <select name="size" id="size" bind:value={size}>
                            <option value="" disabled>Select Size</option>
                            {#each sizes as s}
                                <option value={s}>{s}</option>
                            {/each}
                        </select>
                    </div>
                {/if}
            {/if}

            {#if good && !loading}
                <button class="info" transition:slide on:click={order}
                    >Order</button
                >
            {/if}

            {#if retryCreate && retryCreate.show}
                <button
                    class="error"
                    transition:slide
                    on:click={retryCreate.callback}>Retry</button
                >
            {/if}

            {#if retrySend && retrySend.show}
                <button
                    class="error"
                    transition:slide
                    on:click={retrySend.callback}>Retry</button
                >
            {/if}
        </form>
    </div>
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

    input,
    select {
        width: calc(calc(100vw - 18ch) - 2em);
        padding: 1em;
        border-radius: 0.25em;
        font-weight: bold;
        font-size: 16px;
        color: black;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    form > .in {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
    }

    [type="checkbox"] {
        width: auto;
        padding: 2em;
    }

    form > #download-button.in {
        justify-content: center;
    }

    form > .cb {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
        justify-content: start;
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

    button,
    a {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-family: Verdana, Tahoma, sans-serif;
    }

    button,
    a {
        font-size: 16px;
        padding: 2em;
    }

    label {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    a#download {
        position: initial;
        flex-grow: 1;
    }

    @media print {
    }
</style>

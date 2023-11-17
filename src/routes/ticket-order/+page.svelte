<script lang="ts">
    import type { Merch, Ticket } from "@prisma/client";
    import Header from "$lib/Header.svelte";
    import { slide } from "svelte/transition";
    import { generateReceipt, generateTicket } from "$lib";
    import { onMount } from "svelte";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";
    import { error } from "@sveltejs/kit";

    interface GW {
        PDFDocument: PDFKit.PDFDocument;
        SVGO: { optimize: (s: string) => string };
    }

    type Data = Ticket & { Merch: Merch | null };

    type ResData = { data: Data; error: string | null };

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
    let messages: { error?: boolean; text: string }[] = [];

    let loading = false;
    let fillename = "";

    function createCallback(b: Blob) {
        return async function () {
            if (!fillename) return;
            // window.location.pathname = `/download-pdf`;
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fillename,
                    types: [
                        {
                            accept: {
                                "application/pdf": [".pdf"],
                            },
                            description: "Document",
                        },
                    ],
                });
                const wstream = await handle.createWritable();
                await wstream.write(b);
                await wstream.close();
                name = "";
                size = "";
                email = "";
                process = "";
                loading = false;
            } catch (error) {}
        };
    }

    let download: RetryButton = {
        show: false,
        callback: async () => {},
    };

    let blob: Blob;
    let _pdf: ArrayBufferLike;

    let process = "";

    type RetryButton = {
        show: boolean;
        callback: () => Promise<void>;
    };

    let i = 0;

    let retryCreate: RetryButton | null = null;
    let retryGenerate: RetryButton | null = null;
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

    async function sendEmail(data: Data, pdf: ArrayBufferLike) {
        return await (
            await fetch(
                data.Merch
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

    async function create(): Promise<ResData> {
        return await (
            await fetch(
                bundling
                    ? `${
                          dev
                              ? `http://${$page.url.hostname}:3000`
                              : import.meta.env.VITE_EMAIL_URL
                      }/order-bundling`
                    : `${
                          dev
                              ? `http://${$page.url.hostname}:3000`
                              : import.meta.env.VITE_EMAIL_URL
                      }/order-ticket`,
                {
                    body: JSON.stringify({
                        name,
                        size,
                        email,
                    }),
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "no-cors": "true",
                    },
                }
            )
        ).json();
    }

    async function generate(resdata: ResData) {
        if (resdata.data.Merch) {
            blob = await generateReceipt(
                { ...resdata.data.Merch, ticket: resdata.data },
                pdf
            );
            _pdf = await blob.arrayBuffer();
        } else {
            blob = await generateTicket(resdata.data, pdf);
            _pdf = await blob.arrayBuffer();
        }
    }

    async function order() {
        if (!good) return;
        pdf = w.PDFDocument;
        if (pdf == undefined) return;
        messages = [];
        loading = true;
        process = "Creating Data";

        let createResult: ResData = await create();

        if (createResult.error) {
            messages = [
                ...messages,
                { text: "Error when creating data", error: true },
            ];

            retryCreate = { show: true, callback: order };
            process = "";
            return;
        }

        retryCreate = null;

        messages = [...messages, { text: "Done creating data" }];
        process = "Generating PDF";

        await generate(createResult);

        if (!_pdf) {
            messages = [
                ...messages,
                { text: "Error when generating pdf", error: true },
            ];
            retryGenerate = {
                show: true,
                callback: async () => {
                    process = "Generating PDF";
                    await generate(createResult);
                },
            };
            process = "";
            return;
        }

        messages = [...messages, { text: "Done generating pdf" }];
        retryGenerate = null;
        process = "Sending PDF";

        fillename = `${createResult.data.name}_${createResult.data.id}.pdf`;

        let res: { status: string } | undefined = await sendEmail(
            createResult.data,
            _pdf
        );

        download = { callback: createCallback(blob), show: true };

        if (!res || res.status == "Failed") {
            messages = [
                ...messages,
                { text: "Error when sending pdf", error: true },
            ];

            retrySend = {
                show: true,
                callback: async () => {
                    process = "Sending PDF";
                    await sendEmail(createResult.data, _pdf);
                },
            };
            process = "";
            return;
        }

        messages = [...messages, { text: "Done sending pdf" }];

        retrySend = null;

        name = "";
        size = "";
        email = "";
        process = "";
    }

    $: noerror = true;
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form>
            {#if loading}
                {#each messages as e, i}
                    <div class="in" class:error={e.error} class:info={!e.error}>
                        <label for="msg-{i}">Status</label>
                        <input
                            type="text"
                            readonly
                            value={e.text}
                            id="msg-{i}"
                        />
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
                    <div
                        class="in"
                        id="download-button{noerror ? '-float' : ''}"
                    >
                        <button
                            id="download{noerror ? '-float' : ''}"
                            class="info"
                            on:click={download.callback}
                            >Download PDF file</button
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

    button {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        font-family: Verdana, Tahoma, sans-serif;
    }

    button {
        font-size: 16px;
        padding: 2em;
    }

    label {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    button#download {
        position: initial;
        flex-grow: 1;
    }

    @media print {
    }
</style>

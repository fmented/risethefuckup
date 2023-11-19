<script lang="ts">
    import type { Merch, Ticket } from "@prisma/client";
    import Header from "$lib/Header.svelte";
    import { slide } from "svelte/transition";
    import { pdf } from "$lib/pdf";
    import { dev } from "$app/environment";
    import { page } from "$app/stores";
    import { supported, fileSave } from "browser-fs-access";
    import { canShare, share } from "$lib/share";

    type Data = Ticket & { Merch: Merch | null };

    type ResData = { data: Data; error: string | null };

    let name = "";
    let bundling = false;
    let size = "";
    let email = "";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    let messages: { error?: boolean; text: string }[] = [];

    let loading = false;
    let filename = "";

    $: if (bundling == false) {
        size = "";
    }

    function createCallback(file: File) {
        return async function () {
            if (!filename) return;

            if (canShare(file)) {
                return share(file)?.then((_) => {
                    name = "";
                    size = "";
                    email = "";
                    process = "";
                    bundling = false;
                    loading = false;
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
                    const wstream = await handle.createWritable();
                    await wstream.write(file);
                    await wstream.close();
                    name = "";
                    size = "";
                    email = "";
                    process = "";
                    bundling = false;

                    loading = false;
                } catch (error) {}
            } else {
                fileSave(file, {
                    fileName: filename,
                    extensions: [".pdf"],
                }).then((_) => {
                    name = "";
                    size = "";
                    email = "";
                    process = "";
                    bundling = false;

                    loading = false;
                });
            }
        };
    }

    let download: { show: boolean; callback: () => void } = {
        show: false,
        callback: async () => {},
    };

    let file: File;
    let _pdf: ArrayBufferLike;

    let process = "";

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
        if (resdata.data) {
            file = await $pdf.createPDF(resdata.data);
            _pdf = await file.arrayBuffer();
        }
    }

    async function order() {
        if (!good) return;
        messages = [];
        loading = true;
        process = "Creating Data";

        let createResult: ResData = await create();

        if (createResult.error) {
            messages = [
                ...messages,
                { text: "Error when creating data", error: true },
            ];

            process = "";
            return;
        }

        messages = [...messages, { text: "Done creating data" }];
        process = "Generating PDF";

        await generate(createResult);

        if (!_pdf) {
            messages = [
                ...messages,
                { text: "Error when generating pdf", error: true },
            ];

            process = "";
            return;
        }

        messages = [...messages, { text: "Done generating pdf" }];
        process = "Sending PDF";

        filename = `${createResult.data.name}_${createResult.data.id}.pdf`;

        let res: { status: string } | undefined = await sendEmail(
            createResult.data,
            _pdf
        );

        download = { callback: createCallback(file), show: true };

        if (!res || res.status == "Failed") {
            messages = [
                ...messages,
                { text: "Error when sending pdf", error: true },
            ];

            process = "";
            return;
        }

        messages = [...messages, { text: "Done sending pdf" }];

        name = "";
        size = "";
        email = "";
        process = "";
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form class="slide">
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
                    <div class="in" id="download-button{true ? '-float' : ''}">
                        <button
                            id="download{true ? '-float' : ''}"
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
                    <input type="email" bind:value={email} id="email" />
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
                    <div class="in" transition:slide>
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
                <button class="info" transition:slide on:pointerup={order}
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
        background-color: #222;
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
        width: calc(calc(90vw - 18ch) - 2em);
        padding: 1em;
        border-radius: 0.25em;
        font-weight: bold;
        font-size: 16px;
        color: black;
        flex-grow: 1;
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

    form > .cb {
        display: flex;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
        justify-content: space-between;
    }

    [type="checkbox"] {
        width: auto;
        -webkit-appearance: none;
        appearance: none;
        font: inherit;
        color: white;
        width: 1.15em;
        height: 1.15em;
        border: 0.15em solid currentColor;
        border-radius: 0.15em;
        transform: translateY(-0.075em);
        display: grid;
        padding: 0;
        place-content: center;
        background-color: white;
        flex-grow: 0;
    }

    input[type="checkbox"]::before {
        content: "";
        width: 0.8em;
        height: 0.8em;
        transform: scale(0);
        background-color: #ed7;
        transition: 120ms transform ease-in-out;
        box-shadow: inset 1em 1em var(--form-control-color);
    }

    input[type="checkbox"]:checked::before {
        transform: scale(1);
    }

    form > #download-button.in {
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
        border-radius: 1rem;
        overflow: hidden;
    }

    button {
        position: fixed;
        bottom: 2px;
        left: 1px;
        right: 1px;
        text-align: center;
        font-family: Verdana, Tahoma, sans-serif;
    }

    button {
        font-size: 16px;
        padding: 2em;
    }

    label {
        min-width: calc(8ch);
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        cursor: pointer;
    }

    button#download {
        position: initial;
        flex-grow: 1;
    }

    @media print {
    }
</style>

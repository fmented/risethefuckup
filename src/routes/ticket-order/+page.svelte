<script lang="ts">
    import type { Merch, Ticket } from "@prisma/client";
    import Header from "$lib/Header.svelte";
    import { slide } from "svelte/transition";
    import { generateReceipt, generateTicket } from "$lib";
    import { onMount } from "svelte";

    interface GW {
        PDFDocument: PDFKit.PDFDocument;
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

    let link = "";
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
        pdf: string
    ) {
        return await (
            await fetch(
                "ticketId" in data
                    ? "/api/v1/bundlingpdf/" + data.ticketId + "/send"
                    : `/api/v1/ticketpdf/` + data.id + "/send",
                {
                    body: JSON.stringify({
                        name,
                        to: email,
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

    async function order() {
        if (!good) return;
        if (pdf == undefined) return;
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

            let _pdf: string;

            if ("ticketId" in data && typeof data.name === "string") {
                const blob = await generateReceipt(data, pdf);
                _pdf = await blob2uri(blob);
            } else {
                const blob = await generateTicket(data, pdf);
                _pdf = await blob2uri(blob);
            }

            messages = [
                ...messages,
                _pdf == undefined
                    ? "Error when generating PDF"
                    : "Done generating pdf",
            ];

            process = "Sending PDF";

            const res: { status: string } = await sendEmail(data, _pdf);

            messages = [
                ...messages,
                res.status == "Failed"
                    ? "Error when sending PDF"
                    : "Done sending pdf",
            ];

            link = _pdf;

            // id = data.id;

            // process = "Generating PDF";

            // const d2 = await (
            //     await fetch(
            //         bundling
            //             ? "/api/v1/bundlingpdf/" + id
            //             : `/api/v1/ticketpdf/` + id
            //     )
            // ).json();

            //     if (!d2.pdf) return;

            //     messages = [
            //         ...messages,
            //         !d2.pdf
            //             ? "Error when generating pdf"
            //             : "Success generating pdf",
            //     ];

            //     process = "Sending PDF";

            // const d3 = await (
            //     await fetch(
            //         "ticketId" in data
            //             ? "/api/v1/bundlingpdf/" + data.ticketId + "/send"
            //             : `/api/v1/ticketpdf/` + id + "/send",
            //         {
            //             body: JSON.stringify({
            //                 name,
            //                 to: bundling
            //                     ? d2.merch.ticket.email
            //                     : d2.ticket.email,
            //                 pdf: d2.pdf,
            //             }),
            //             method: "POST",
            //             headers: {
            //                 "content-type": "application/json",
            //             },
            //         }
            //     )
            // ).json();

            //     if (d3.status === "Success") {
            //         messages = [...messages, "Success sending pdf"];
            //         link = d2.pdf;
            //     } else return (messages = [...messages, "Error when sending pdf"]);
        } catch (error) {
            messages = [...messages, error as string];
            console.error(error);
        }

        process = "";
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form>
            {#if loading}
                {#each messages as e, i}
                    <div class="in">
                        <label for="error-{i}">Status</label>
                        <input type="text" value={e} id="error-{i}" />
                    </div>
                {/each}
                {#if process}
                    <div class="in">
                        <label for="process">Process</label>
                        <input type="text" value={process} id="process" />
                    </div>
                {/if}
                {#if link}
                    <a
                        href={link}
                        class="info"
                        download="{name}.pdf"
                        rel="noopener noreferrer">Download PDF file</a
                    >
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

    @media print {
    }
</style>

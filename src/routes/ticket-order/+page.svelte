<script lang="ts">
    import type { Merch } from "$lib";
    import Header from "$lib/Header.svelte";
    import { slide } from "svelte/transition";

    let name = "";
    let bundling = false;
    let size = "";
    let email = "";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    $: good = bundling ? name && size && email : name && email;

    function order() {
        if (!name) return;
        window
            .fetch(
                bundling ? "/api/v1/order-bundling" : `/api/v1/order-ticket`,
                {
                    body: JSON.stringify({
                        name,
                        size,
                        email,
                    }),
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        passcode: localStorage.getItem("passcode") || "",
                    },
                }
            )
            .then((res) => {
                res.json().then((v) => {
                    window.location.href = bundling
                        ? `/api/v1/bundlingpdf/${v.id}?send=true`
                        : `/api/v1/ticketpdf/${v.id}?send=true`;
                });
            });
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form>
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
                <input type="checkbox" bind:checked={bundling} id="bundling" />
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

            {#if good}
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

    button {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
    }

    button {
        font-size: 16px;
        padding: 2em;
    }

    label {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    @media print {
    }
</style>

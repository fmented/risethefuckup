<script lang="ts">
    import type { Merch } from "$lib";
    import Header from "$lib/Header.svelte";

    let name = "";
    let size = "";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    $: good = name && size;

    function order() {
        if (!(name && size)) return;
        window
            .fetch(`/api/v1/order-merch`, {
                body: JSON.stringify({
                    size,
                    name,
                }),
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    passcode: localStorage.getItem("passcode") || "",
                },
            })
            .then((res) => {
                res.json().then((v: Merch) => {
                    window.location.pathname = "/order-succes/" + v.qr;
                });
            });
    }
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <form>
            <div>
                <label for="name">Name</label>
                <input type="text" bind:value={name} id="name" />
            </div>
            <div>
                <label for="size">Size</label>
                <select name="size" id="size" bind:value={size}>
                    <option value="" disabled>Select Size</option>
                    {#each sizes as s}
                        <option value={s}>{s}</option>
                    {/each}
                </select>
            </div>
            {#if good}
                <div>
                    <button class="info" on:click={order}>Order</button>
                </div>
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
    }

    form > div {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
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

    @media print {
    }
</style>

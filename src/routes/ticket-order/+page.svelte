<script lang="ts">
    import type { Merch } from "$lib";
    import Header from "$lib/Header.svelte";

    let name = "";

    $: good = name;

    function order() {
        if (!name) return;
        window
            .fetch(`/api/v1/order-ticket`, {
                body: JSON.stringify({
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
                    window.location.pathname = "/ticket-order-success/" + v.id;
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

    input {
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

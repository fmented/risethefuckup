<script lang="ts">
    let passcode = "";
    let error = "";
    import { slide } from "svelte/transition";
    const redirectif = [0, 300, 301, 302, 303];

    async function setPasscode() {
        if (!passcode) return;
        const data = JSON.stringify({
            passcode: btoa(passcode),
            date: Date.now(),
        });

        const res = await window.fetch(window.location.href, {
            method: "POST",
            headers: {
                passcode: btoa(data),
            },
            redirect: "manual",
        });

        if (redirectif.includes(res.status)) {
            window.location.pathname = res.statusText;
        }

        const message = (await res.json()) || { status: "" };
        error = message.status;

        setTimeout(() => (error = ""), 3000);
    }
</script>

<form>
    {#if error}
        <strong class="error" transition:slide>{error}</strong>
    {/if}
    <div>
        <label for="passcode">Passcode</label>
        <input type="text" bind:value={passcode} id="passcode" />
    </div>
    {#if passcode}
        <button transition:slide class="info" on:click={setPasscode}
            >Check Passcode</button
        >
    {/if}
</form>

<style>
    label {
        color: #ed7;
    }
    input {
        width: calc(calc(100vw - 18ch) - 2em);
        padding: 1em;
        border-radius: 0.25em;
        font-weight: bold;
        font-size: 16px;
        color: black;
    }

    strong {
        text-align: center;
        padding: 1em;
    }

    div {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
        padding: 1rem;
        margin-top: 2rem;
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
        button {
            display: none;
        }
    }
</style>

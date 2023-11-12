<!-- <script lang="ts">
    let passcode = "";

    function setPasscode() {
        if (!passcode) return;
        window
            .fetch(window.location.href, {
                method: "POST",
                headers: {
                    passcode,
                },
            })
            .then((res) => {
                if (res.ok) {
                    window.location.pathname = "/check-in";
                }
            });
    }
</script>

<form>
    <div>
        <label for="passcode">Passcode</label>
        <input type="text" bind:value={passcode} id="passcode" />
    </div>
    {#if passcode}
        <button class="info" on:click={setPasscode}>Check Passcode</button>
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

    div {
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
        button {
            display: none;
        }
    }
</style> -->

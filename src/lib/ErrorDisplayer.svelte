<script lang="ts">
    export let data: { error: string };

    $: error = data.error;
</script>

<form>
    {#if error}
        <div>
            <label for="error">Error</label>
            <input value={error} disabled id="error" class="error" />
        </div>
    {/if}
</form>

<style>
    input {
        width: calc(calc(100vw - 18ch) - 2em);
        padding: 1em;
        border-radius: 0.25em;
        font-weight: bold;
        font-size: 16px;
    }

    div {
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
    }

    form {
        height: 100%;
        font-size: large;
        display: flex;
        flex-direction: column;
        gap: 2em;
    }
</style>

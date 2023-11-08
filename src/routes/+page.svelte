<script lang="ts">
    import type ScannerType from "$lib/Scanner.svelte";
    import Scanner from "$lib/Scanner.svelte";
    import ResponseDisplayer from "$lib/ResponseDisplayer.svelte";
    import { afterUpdate } from "svelte";
    import Header from "$lib/Header.svelte";
    import type { TicketExtended } from "$lib";
    import ErrorDisplayer from "$lib/ErrorDisplayer.svelte";

    let scanner: ScannerType;
    let data: TicketExtended  | { error: string } | null = null;

    async function onScanSuccess(decodedText: string) {
        const res: TicketExtended | { error: string } = await (
            await window.fetch(`/qr`, {
                body: JSON.stringify({ qr: decodedText }),
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
            })
        ).json();

        scanner.stop();

        data = {...res};
    }

    async function ok(qr: TicketExtended) {
        if(qr.used > 0) return data = null
        
            await window.fetch(`/in`, {
                body: JSON.stringify(qr),
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
            })
        

        data = null;
    }

    async function buttonCallback() {
        if (data !== null && "used" in data) return ok(data);
        data = null
    }



    afterUpdate(()=>{
        setTimeout(()=>{if(data==null) scanner.scan()}, 0)
    })
</script>

<div class="fuck">
    <Header/>
    <div class="main">
    {#if data}
        {#if "valid" in data}
            <ResponseDisplayer {data}/>
            {:else}
            <ErrorDisplayer {data}/>
        {/if}
        {:else}
        <Scanner bind:this={scanner} on:scan={(e) => onScanSuccess(e.detail)} />
    {/if}

    </div>

    {#if data}
        <button on:click={buttonCallback} class="info">{data === null ? "Scan" : "OK"}</button>
    {/if}
</div>

<style>
        .fuck {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        background-color: #555;
        color: #ED7;
    }

    .fuck > .main{
        width: 100vw;
        height: 100%;
        padding: 2em;
    }

    

    button{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
    }

    button{
        font-size: 16px;
        padding: 2em;
    }

    
</style>

<script lang="ts">
    import type { TicketExtended } from "./index.js";
    import QRCode from "qrcode-svg";

    export let data: TicketExtended

    const f = Intl.DateTimeFormat("id", {
        dateStyle:"long",
        timeZone: "Asia/Jakarta",
        timeStyle: "short"
    })

    export let inverse = false
    
    $: qr = data.qr

    $: valid = data.valid

    $: last_used = data.last_used

    $: cls = data.class
</script>


<form>

        {#if qr !== undefined}
            <div>
                {@html (new QRCode({content:qr , background: "#222", color:"#ED7", join:true, container:"svg-viewbox"})).svg()}
            </div>
        {/if}

     {#if valid != undefined}
            <div>
                <label for="class">Class</label>
                <input
                    type="text"
                    value={cls}
                    disabled
                    id="class"
                />
            </div>
            <div>
                <label for="status">Status</label>
                <input
                    type="text"
                    value={valid? "Unused" : `Used`}
                    disabled
                    id="status"
                    class:error={!inverse ? !valid : valid}
                    class:ok={!inverse ? valid : !valid}
                />
            </div>
    {/if}
    
            {#if !valid}
                <div>
                    <label for="stadatetus">Used At</label>
                    <input
                        type="datetime"
                        value={f.format(new Date(last_used))}
                        disabled
                        id="date"
                    />
                </div>
            {/if}
</form>

<style>

    input{
        width: calc(calc(100vw - 18ch) - 2em);
        padding: 1em;
        border-radius: .25em;
        font-weight: bold;
        font-size: 16px;
    }


    div{
        display: flex;
        justify-content: space-between;
        gap: 2em;
        align-items: center;
        font-size: large;
    }

    form{
        height: 100%;
        font-size: large;
        display: flex;
        flex-direction: column;
        gap: 2em;
    }


</style>

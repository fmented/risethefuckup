<script lang="ts">
    import type { Merch, Ticket } from "$lib";
    import Header from "$lib/Header.svelte";

    export let data: { merchs: Merch[]; tickets: Ticket[] } = {
        merchs: [],
        tickets: [],
    };

    function buttonCallback() {
        window.print();
    }

    const f = Intl.DateTimeFormat("id", {
        dateStyle: "short",
        timeZone: "Asia/Jakarta",
        timeStyle: "short",
    });
</script>

<div class="fuck">
    <Header />
    <div class="main">
        <div>
            <h1>Merch</h1>
            <small>{data?.merchs?.length || 0} Rows</small>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Redeemed At</th>
                        <th>Valid</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data?.merchs || [] as r}
                        <tr>
                            <td
                                ><a
                                    href="/api/v1/merchpdf/{r.qr}"
                                    download="receipt {r.name}.pdf">{r.id}</a
                                ></td
                            >
                            <td>{r.name}</td>
                            <td>{r.size}</td>
                            <td
                                >{r.claimedAt
                                    ? f.format(new Date(r.claimedAt))
                                    : "-"}</td
                            >
                            <td>{r.valid ? "✔️" : "❌"}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div>
            <h1>Ticket</h1>
            <small>{data?.tickets?.length || 0} Rows</small>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Checked-In At</th>
                        <th>Valid</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data?.tickets || [] as r}
                        <tr>
                            <td
                                ><a
                                    href="/api/v1/ticketpdf/{r.qr}"
                                    download="ticket {r.name}.pdf">{r.id}</a
                                ></td
                            >
                            <td>{r.name}</td>
                            <td
                                >{r.checkInAt
                                    ? f.format(new Date(r.checkInAt))
                                    : "-"}</td
                            >
                            <td>{r.valid ? "✔️" : "❌"}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    {#if data}
        <button on:click={buttonCallback} class="info">{"PRINT"}</button>
    {/if}
</div>

<style>
    td,
    th {
        border: 2px solid #ed7;
        text-align: center;
    }

    small {
        margin-bottom: 0.5rem;
    }

    td {
        padding: 0.5em;
    }

    tr > td:first-of-type {
        text-align: left;
        word-break: break-all;
    }

    table {
        table-layout: fixed;
        width: 100%;
        border-collapse: collapse;
    }

    .fuck,
    a {
        display: grid;
        height: 100%;
        grid-template-rows: auto 1fr;
        color: #ed7;
        background-color: #222;
        text-decoration: none;
    }

    .fuck > .main {
        width: 100vw;
        display: flex;
        flex-direction: column;
        background-color: #222;

        gap: 2rem;
        height: 100%;
        padding: 2em;
        background-size: cover;
        background-position-x: 50%;
        background-repeat: no-repeat;
        padding-bottom: 6rem;
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
        * {
            color: black;
        }

        th,
        td {
            border: 2px solid black;
        }

        button {
            display: none;
        }
    }
</style>

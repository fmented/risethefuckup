<script lang="ts">
    import { onMount } from "svelte";

    let location: any;

    onMount(() => {
        location = window.location;
    });
</script>

<div class="links">
    <a
        href="/check-in"
        class:active-link={location?.pathname == "/check-in"}
        rel="external">CHECK IN</a
    >
    <a
        href="/claim"
        class:active-link={location?.pathname == "/claim"}
        rel="external">REDEEM</a
    >

    <a
        href="/stats"
        class:active-link={location?.pathname.startsWith("/stats")}
        rel="external">STATS</a
    >

    <a
        href="/ticket-order"
        class:active-link={location?.pathname.startsWith("/ticket")}
        rel="external">ORDER</a
    >
</div>

<style>
    a {
        color: #ed7;
        padding: 0.5em;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
    }

    .links {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5em;
        font-weight: 600;
        background-color: #555;
        padding-inline: 2em;
    }

    .links > a.active-link {
        background-color: #ed7;
        color: #555;
    }

    @media print {
        .links {
            display: none;
        }
    }
</style>

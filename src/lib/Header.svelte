<script lang="ts">
    import { onMount } from "svelte";

    let location: any;

    onMount(() => {
        location = window.location;
    });
</script>

<div class="links">
    <a
        href="/checkin"
        class:active-link={location?.pathname == "/checkin"}
        rel="external">Masuk</a
    >
    <a
        href="/claim"
        class:active-link={location?.pathname == "/claim"}
        rel="external">Merch</a
    >

    <a
        href="/stats"
        class:active-link={location?.pathname.startsWith("/stats")}
        rel="external">Stats</a
    >

    <a
        href="/order"
        class:active-link={location?.pathname.startsWith("/order")}
        rel="external">Order</a
    >
</div>

<style>
    a {
        color: #ed7;
        padding: 0.5em;
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

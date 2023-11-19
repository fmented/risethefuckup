<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    let location: any;

    onMount(() => {
        location = window.location;
    });
</script>

<div class="links">
    <a
        href="/check-in"
        class:active-link={$page.url.pathname == "/check-in"}
        rel="external">CHECK IN</a
    >
    <a
        href="/claim"
        class:active-link={$page.url.pathname == "/claim"}
        rel="external">REDEEM</a
    >

    <a
        href="/stats"
        class:active-link={$page.url.pathname == "/stats"}
        rel="external">STATS</a
    >

    <a
        href="/ticket-order"
        class:active-link={$page.url.pathname.startsWith("/ticket")}
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
        border-radius: 1rem;
    }

    .active-link {
        background-color: #ed7;
        color: #555;
        border-radius: 0.5rem;
        padding-inline: 2em;
        will-change: transform opacity;

        animation-name: rotate;
        animation-duration: 800ms;
        animation-timing-function: cubic-bezier(0.39, 0.575, 0.565, 1);
        animation-fill-mode: forwards;
        animation-delay: 500ms;
    }

    @keyframes rotate {
        0% {
            transform: rotate(125deg);
        }
        45% {
            transform: rotate(-75deg);
        }
        55% {
            transform: rotate(75deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media print {
        .links {
            display: none;
        }
    }
</style>

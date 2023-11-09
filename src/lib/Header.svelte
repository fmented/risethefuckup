<script lang="ts">
    import { onMount } from "svelte";

    let location: any;

    onMount(() => {
        location = window.location;
    });
</script>

<div class="links">
    <a href="/" class:active-link={location?.pathname == "/"} rel="external"
        >Masuk</a
    >
    <a
        href="/revalidate"
        class:active-link={location?.pathname == "/revalidate"}
        rel="external">Revalidasi</a
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
    }

    .links > a.active-link {
        background-color: #ed7;
        color: #555;
    }
</style>

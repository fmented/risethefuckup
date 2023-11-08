<script lang="ts">
    import { onMount } from "svelte";

    let location: any;

    onMount(() => {
        location = window.location;
    });
</script>

<div class="links">
    <a href="/" class:active-link={location?.pathname == "/"}>Masuk</a>
    <a
        href="/revalidate"
        class:active-link={location?.pathname == "/revalidate"}>Revalidasi</a
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
    }

    .links > a.active-link {
        background-color: #ed7;
        color: #555;
    }
</style>

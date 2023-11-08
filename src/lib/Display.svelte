<script lang="ts">
    import Header from "$lib/Header.svelte";
</script>

<div class="fuck">
    <Header/>
    <div class="main">
    <slot name="main"/>

    </div>

    <slot name="action"/>
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

    

    
</style>

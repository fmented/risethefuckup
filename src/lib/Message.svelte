<script lang="ts">

export let type: "info"|"warning"|"error"|"ok"|"regular" = "regular" 

type Border = {left?:boolean, right?:boolean, top?:boolean, bottom?:boolean}
type Radius = {topleft?:boolean, topright?:boolean, bottomleft?:boolean, bottomright?:boolean}

export let message = ""

export let border : Border = {left:false, right:false, top:false, bottom:false}
export let radius: Radius = {topleft:false, topright:false, bottomleft:false, bottomright:false}


$: borderBottom = border.bottom
$: borderTop = border.top
$: borderLeft = border.left
$: borderRight = border.right

$: borderRadiusTopLeft = radius.topleft
$: borderRadiusTopRight = radius.topright
$: borderRadiusBottomLeft = radius.bottomleft
$: borderRadiusBottomRight = radius.bottomright
</script>

<strong class="{type}" class:borderBottom class:borderTop class:borderLeft class:borderRight
class:borderRadiusBottomLeft class:borderRadiusBottomRight class:borderRadiusTopLeft class:borderRadiusTopRight
>
    {message}
</strong>

<style >
    :global(.error){
        background-color: #f43;
        color: black;
    }

    :global(.ok){
        background-color: #5e3;
        color: black;
    }

    :global(.info){
        background-color: #43f;
        color: white;
    }

    :global(.warning){
        background-color: #ff4;
        color: black;
    }

    .regular{
        background-color: transparent;
        color: black;
    }

    .borderRadiusTopLeft{
        border-top-left-radius: 1em;
    }

    .borderRadiusTopRight{
        border-top-right-radius: 1em;
    }

    .borderRadiusBottomLeft{
        border-bottom-left-radius: 1em;
    }

    .borderRadiusBottomRight{
        border-bottom-right-radius: 1em;
    }

    .borderTop{
        border-top: 2px solid black;
    }

    .borderRight{
        border-right: 2px solid black;
    }

    .borderBottom{
        border-bottom: 2px solid black;
    }

    .borderLeft{
        border-left: 2px solid black;   
    }

    strong{
        text-wrap: wrap;
    }
</style>


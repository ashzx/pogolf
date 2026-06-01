<script lang="ts">
    import {gameState} from "../states/GameState.svelte";
    import { generations } from "../metadata.svelte";
    
    let { generation } = $props();

    function toggleGeneration() {
        if (gameState.selectedGenerations.includes(generation)) {
            gameState.selectedGenerations = gameState.selectedGenerations.filter(gen => gen !== generation);
        } else {
            gameState.selectedGenerations = [...gameState.selectedGenerations, generation].sort((a, b) => a - b);
        }
    }

    let checked = $derived.by(() => gameState.selectedGenerations.includes(generation));
</script>

<div class="flex-row">
    <label class="flex items-center space-x-3 rtl:space-x-reverse">
        <input type="checkbox" class="form-checkbox h-5 w-5 " bind:checked={checked} 
            onchange={toggleGeneration} />
        <span class="text-inherit">{generations[generation - 1]}</span>
    </label>
</div>
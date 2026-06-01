<script lang="ts">
	import { gameState } from "../../states/GameState.svelte";
</script>

<h3 class="text-xl mb-6 text-center puzzle-par-container">
    {#if gameState.gameType === 'daily'}
        Today's Challenge, {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} - 
    {:else}
        Endless Mode - 
    {/if}
    <span class="puzzle-par-label">Par</span>
    <span id="puzzle-par" class="font-bold">{gameState.solution.length - 2}</span>
</h3>
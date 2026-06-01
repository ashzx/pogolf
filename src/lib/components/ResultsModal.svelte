<script>
    import { tick } from "svelte";
    import { gameState, loseGame } from "../../states/GameState.svelte";
    import GivenUp from "../GivenUp.svelte";
    import Winner from "../Winner.svelte";
    let dialog = $state();

    let shouldOpen = $derived(gameState.showResults && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost'));

    $effect(() => {
        dialog?.classList.toggle('hidden', !shouldOpen);
        // Add modal-open class to body to prevent background scrolling
        document.body.classList.toggle('modal-open', shouldOpen);
    });

    const closeDialog = () => {
        gameState.showResults = false;
        // dialog?.trigger('close');
    };
</script>

<div bind:this={dialog} class="modal z-50 fixed inset-0 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 space-y-4 shadow-xl relative max-h-10/12 overflow-y-scroll">
        <button type="button" data-close="modal" onclick={closeDialog}
            class="cursor-pointer absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl font-bold">&times;
            <span class="sr-only">Close</span>
            </button>
        <div class="text-center">
            <h2 class="text-2xl font-semibold text-gray-900">
                {#if gameState.gameStatus === 'won'}
                    Congratulations!
                {:else if gameState.gameStatus === 'lost'}
                    Better luck next time!
                {/if}
            </h2>
        </div>
        {#if gameState.gameStatus === 'won'}
            <Winner />
        {:else if gameState.gameStatus === 'lost'}
            <GivenUp />
        {/if}
    </div>
</div>

<div class="modal-backdrop fixed inset-0 bg-gray-900 opacity-50 z-40" class:hidden={!shouldOpen}></div>

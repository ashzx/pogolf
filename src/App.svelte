<script>
    import AlreadyPlayedToday from "./lib/AlreadyPlayedToday.svelte";
    import GuessForm from "./lib/GuessForm.svelte";
    import game from './GameBootstrapper.svelte';
    import gameBootstrapper from "./GameBootstrapper.svelte";
    import { gameState } from "./states/GameState.svelte";
    import GuessItem from "./lib/GuessItem.svelte";
    import Par from "./lib/components/Par.svelte";
    import ResultsModal from "./lib/components/ResultsModal.svelte";
    import ToastContainer from "./lib/components/ToastContainer.svelte";

    // Start a new game on page load
    game.start();
</script>

<ResultsModal />
<ToastContainer />

<div id="game-container">
    <!-- Title -->
    <h2 class="text-xl mb-6 text-center">
        Get from the start Pokémon to the end Pokémon by using names that start
        with what the previous one ends with, in the fewest moves.
        <small>
            <br />e.g. Ekans -&gt; Sceptile -&gt; Eternatus
        </small>
    </h2>
    <Par />

    {#if gameState.gameType === 'endless'}
        <h4 class="text-lg mb-6 text-center" id="daily-mode-link">
            Looking for <button type="button" class="text-teal-500 hover:underline cursor-pointer" onclick={() => gameBootstrapper.changeGameMode('daily')}>the daily challenge</button> instead?
        </h4>
    {:else}
        <h4 class="text-lg mb-6 text-center" id="endless-mode-link">
            Looking for <button type="button" class="text-teal-500 hover:underline cursor-pointer" onclick={() => gameBootstrapper.changeGameMode('endless')}>endless mode</button> instead?
        </h4>
    {/if}
    <hr class="border-gray-300 mb-6" />
    <!-- Game Grid -->
    <h4 class="text-lg mb-2 text-center">Target:</h4>
    <div class="grid grid-cols-7 sticky top-0 bg-gray-900 py-4 z-10">
        <!-- Row 1 -->
        <div
            class="flex justify-center col-span-3"
            id="word-one-container"
        >
            <GuessItem name={gameState.startingPokemon} />
        </div>
        <!-- Right arrow -->
        <div class="flex justify-center items-center col-span-1">
            <svg
                class="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                >
                </path>
            </svg>
        </div>
        <!-- Row 2 -->
        <div
            class="flex justify-center col-span-3"
            id="word-two-container"
        >
            <GuessItem name={gameState.endingPokemon} />
        </div>
    </div>
    <hr class="border-gray-300 my-6" />

    <div class="grid grid-cols-1 gap-2">
        <h4 class="text-lg mb-2 text-center">Your moves:</h4>
        <div class="flex flex-col items-center" id="move-container">
            {#each gameState.guesses as guess}
                <GuessItem name={guess} class="mb-3 shine-quick"/>
            {/each}
        </div>
    </div>

    <GuessForm />
</div>

<AlreadyPlayedToday />

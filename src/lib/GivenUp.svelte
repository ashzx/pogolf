<script lang="ts">
    import { gameState } from "../states/GameState.svelte";
    import gameLogic from "../GameLogic.svelte";
    import gameBootstrapper from "../GameBootstrapper.svelte";
    import GuessItem from "./GuessItem.svelte";
    import Button from "./forms/Button.svelte";

    const playDailyChallenge = () => {
        gameBootstrapper.changeGameMode("daily");
    };

    const playEndlessMode = () => {
        gameBootstrapper.changeGameMode("endless");
    };
</script>

<div class="text-center">
    <p class="mt-2 mb-3 text-gray-700">You gave up on the challenge.</p>
</div>

<hr class="border-gray-300 my-2" />
<div class="grid grid-cols-1 gap-1">
    {#if gameState.gameType === "endless"}
        <Button
            buttonColour="primary"
            text="Try another round of endless mode"
            class="mt-0! py-6!"
            onclick={playEndlessMode}
        />
        <Button
            buttonColour="secondary"
            text="Do the daily challenge"
            class="mt-1!"
            onclick={playDailyChallenge}
        />
    {:else}
        <Button
            buttonColour="secondary"
            text="Play endless mode"
            class="mt-0!"
            onclick={playEndlessMode}
        />
    {/if}
</div>
<hr class="border-gray-300 my-2" />

<div class="grid grid-cols-2 gap-3">
    <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900">Potential solution ({gameLogic.numberOfSolutions()} total):</h3>
        <div class="our-modal-moves mt-2">
            {#each gameState.solution as move, index}
                <GuessItem
                    name={move}
                    separator={index < gameState.solution.length - 1}
                    class="w-auto md:min-w-auto"
                />
            {/each}
        </div>
    </div>
    <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900">How you could've solved it:</h3>
        <div class="your-modal-hint mt-2">
            {#each gameState.guesses as move, index}
                <GuessItem
                    name={move}
                    separator={true}
                    class="w-auto md:min-w-auto"
                />
            {/each}
            {#each gameState.userSolution as move, index}
                <GuessItem
                    name={move}
                    separator={true}
                    class="w-auto md:min-w-auto text-red-500"
                />
            {/each}
            <GuessItem name={gameState.endingPokemon!} class="w-auto md:min-w-auto" />
        </div>
    </div>
</div>

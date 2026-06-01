<script lang="ts">
    import { gameState, calculateScore } from "../states/GameState.svelte";
    import gameLogic from "../GameLogic.svelte";

    import XTwitterIcon from "~icons/fa6-brands/x-twitter";
    import RedditIcon from "~icons/fa6-brands/reddit";
    import FacebookIcon from "~icons/fa6-brands/facebook";
    import WhatsappIcon from "~icons/fa6-brands/whatsapp";
    import DiscordIcon from "~icons/fa6-brands/discord";

    import { shareData as GameStateShareData } from "../states/GameState.svelte";
    import type { shareDataType } from "../types/types.svelte";
    import gameBootstrapper from "../GameBootstrapper.svelte";
    import ShareIntent from "./components/ShareIntent.svelte";
    import GuessItem from "./GuessItem.svelte";
    import Button from "./forms/Button.svelte";
    import { toast } from "./components/toast.svelte";

    const playDailyChallenge = () => {
        gameBootstrapper.changeGameMode("daily");
    };

    const copyResultToClipboard = () => {
        const shareData: shareDataType = GameStateShareData();
        navigator.clipboard
            .writeText(shareData.clipboard)
            .then(() => {
                // Show toast TBD
                toast.success("Result copied to clipboard!");
            })
            .catch((error) => {
                toast.error("Error copying to clipboard.");
                console.error("Error copying to clipboard:", error);
            });
    };

    const playEndlessMode = () => {
        gameBootstrapper.changeGameMode("endless");
    };
</script>


<div class="text-center">
    <p class="mt-2 text-gray-700">
        You completed the challenge in {gameState.guesses.length - 2}
        {gameState.guesses.length - 2 === 1 ? "move" : "moves"}!
    </p>
    <p class="mt-2 text-gray-700 font-bold">
        You scored {calculateScore()}!
    </p>
</div>
<hr class="border-gray-300" />
<div class="grid grid-cols-1 gap-1">
    <Button
        buttonColour="primary"
        text="Copy result to clipboard"
        class="py-6 px-4 mt-0!"
        onclick={copyResultToClipboard}
    />
    {#if gameState.gameType === "endless"}
    
        <Button
            buttonColour="secondary"
            text="Play another round of endless mode"
            class="mt-0!"
            onclick={playEndlessMode}
        />
        <Button
            buttonColour="secondary"
            text="Play daily challenge"
            class="mt-0!"
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
<hr class="border-gray-300" />
<div class="grid grid-cols-5 gap-1">
    <ShareIntent
        colour="text-green-500 hover:text-green-700"
        name="WhatsApp"
        emoji={WhatsappIcon}
    />
    <ShareIntent
        colour="text-blue-600 hover:text-blue-800"
        name="Facebook"
        emoji={FacebookIcon}
    />
    <ShareIntent
        colour="text-gray-600 hover:text-gray-900"
        name="X/Twitter"
        emoji={XTwitterIcon}
    />
    <ShareIntent
        colour="text-orange-500 hover:text-orange-700"
        name="Reddit"
        emoji={RedditIcon}
    />
    <ShareIntent
        colour="text-blue-500 hover:text-blue-700"
        name="Discord"
        emoji={DiscordIcon}
    />
</div>
<hr class="border-gray-300" />

<div class="grid grid-cols-2 gap-3">
    <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900">Our route ({gameLogic.numberOfSolutions()} total):</h3>
        <div class="our-modal-moves">
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
        <h3 class="text-xl font-semibold text-gray-900">Your route:</h3>
        <div class="your-modal-moves">
            {#each gameState.guesses as move, index}
                <GuessItem
                    name={move}
                    separator={index < gameState.guesses.length - 1}
                    class="w-auto md:min-w-auto"
                />
            {/each}
        </div>
    </div>
</div>

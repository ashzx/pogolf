<script lang="ts">
	import { gameState, calculateScore, loseGame, winGame } from "../states/GameState.svelte";
	import gameLogic from "../GameLogic.svelte";
	import Button from "./forms/Button.svelte";
	import DailyChallengeReset from "./components/DailyChallengeReset.svelte";
    import gameBootstrapper from "../GameBootstrapper.svelte";
    import { toast } from "./components/toast.svelte";
    import { generateGameHash } from "../states/URLState.svelte";
	import MaterialSettingsIcon from "~icons/material-symbols/settings";
    import SettingsModal from "./components/SettingsModal.svelte";
	import { modalStates, openModal, closeModal } from "../states/ModalState.svelte";



	function submitMove(e: Event) {
		e.preventDefault();
		const pokemonName = (
			document.getElementById("move") as HTMLInputElement
		).value;

		if (pokemonName.trim() === "") {
			toast.error("Please enter a Pokémon name.");
			return;
		}

		(document.getElementById("move") as HTMLInputElement).value = "";
		gameLogic.submitMove(pokemonName);
	}

	function sharePuzzle() {
		if (gameState.gameType === 'daily') {
			toast.error("Sharing is only available in endless mode.");
			return;
		}

		const gameHash = generateGameHash();
		if (!gameHash) {
			toast.error("Failed to generate game link.");
			return;
		}

		const shareableURL = `${window.location.origin}?g=${gameHash}`;
		navigator.clipboard.writeText(shareableURL)
			.then(() => {
				toast.success("Game link copied to clipboard!");
			})
			.catch(() => {
				toast.error("Failed to copy game link.");
			});
	}

	function openSettings() {
		openModal('settings');
	}

</script>

<SettingsModal />
<div
	class="flex justify-center items-center mt-8 mb-8 flex-wrap"
	id="guess-form"
>
	{#if gameState.gameStatus === 'playing'}
		<div class="flex basis-full justify-center items-center">
			<input
				type="text"
				class="mr-2 w-64 py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold border border-gray-600 focus:outline-none focus:border-teal-500 mt-6"
				placeholder="Enter a Pokémon name"
				id="move"
			/>

			<Button text="Submit" id="submit-move" onclick={submitMove} buttonColour="primary" />
		</div>

		<div class="flex basis-full justify-around mt-3 px-16 mb-2">
			<Button text="Give up?" title="Struggling?" id="give-up" onclick={loseGame} buttonColour="ghost-danger" />
			{#if gameState.gameType === 'endless'}
				<Button text="Share puzzle?" title="Share this game. Link will be copied to clipboard." id="share-game" buttonColour="ghost-primary" onclick={sharePuzzle} />
			{/if}
			{#if gameState.gameType === 'endless'}
				<Button text="" icon={MaterialSettingsIcon} title="Change settings" buttonColour="ghost-secondary" onclick={openSettings} />
			{/if}
		</div>
	{:else}
		<div class="z-10 flex justify-center play-again-button my-4 sticky bottom-0 bg-gray-900 py-2 w-100 flex-col">
			{#if gameState.gameStatus === 'won'}
				<p class="text-center font-bold text-lg">You scored {calculateScore()}!</p>
			{:else}
				<p class="text-center font-bold text-lg">You gave up on the challenge.</p>
				
			{/if}

			{#if gameState.gameType === 'endless'}
				<Button text="Play another round of endless mode" onclick={() => gameBootstrapper.changeGameMode('endless')} buttonColour="primary" class="mt-2!" />
			{:else}
				<Button text="Try endless mode" onclick={() => gameBootstrapper.changeGameMode('endless')} buttonColour="primary" class="mt-2!" />
			{/if}

			<Button text="See results"  buttonColour="ghost-primary" class="mt-2!" onclick={() => gameState.showResults = true} />
			
			<div class="self-center">
				<Button text="" icon={MaterialSettingsIcon} title="Change settings" buttonColour="ghost-secondary" onclick={openSettings} />
			</div>

			<p class="mt-5 text-center font-bold">
				<DailyChallengeReset />
			</p>
		</div>
	{/if}

</div>

<svelte:window on:keypress={(e) => {
	if (e.key === "Enter") {
		submitMove(e);
	}
}}></svelte:window>
import { gameState } from './GameState.svelte';
import { toast } from '../lib/components/toast.svelte';

const updateURLParams = () => {
	const url = new URL(window.location.href);
	if (gameState.gameType === 'endless') {
		if (gameState.startingPokemon && gameState.endingPokemon) {
			const gameHash = generateGameHash();
			if (gameHash) {
				url.searchParams.set('g', gameHash);
			}

			// Change window title to include the current game. This allows users to easily share their game by sharing the URL or the window title.
			window.document.title = `PoGolf - ${gameState.startingPokemon} to ${gameState.endingPokemon} - Par ${gameState.solution.length - 2}`;
		}
	} else {
		url.searchParams.delete('g');
		window.document.title = 'PoGolf - Daily Pokémon Golf Game - Par ' + (gameState.solution.length - 2);
	}
	window.history.replaceState({}, '', url.toString());
}

const generateGameHash = () => {
	if (gameState.startingPokemon && gameState.endingPokemon) {
		return btoa(`${gameState.startingPokemon}-${gameState.endingPokemon}-${gameState.selectedGenerations.join(',')}`);
	}
	return null;
}

const decodeGameHash = (gameHash: string) => {
	try {
		const decodedHash = atob(gameHash);
		const [startingPokemon, endingPokemon, selectedGenerations] = decodedHash.split('-');
		return { startingPokemon, endingPokemon, selectedGenerations: selectedGenerations.split(',').map(Number) };
	} catch (e) {
		toast.error('Invalid game link. Starting a new game.');
		return null;
	}
}

const loadGameStateFromURLParams = () => {
	const url = new URL(window.location.href);
	const gameHash = url.searchParams.get('g') as string | null;

	if (gameHash) {
		const decodedGame = decodeGameHash(gameHash);
		if (decodedGame) {
			gameState.gameType = 'endless';
			gameState.isShared = true;
			gameState.startingPokemon = decodedGame.startingPokemon;
			gameState.endingPokemon = decodedGame.endingPokemon;
			gameState.selectedGenerations = decodedGame.selectedGenerations;
		} else {
			gameState.gameType = 'daily';
			gameState.isShared = false;
		}
	} else {
		gameState.gameType = 'daily';
		gameState.isShared = false;
	}
}

loadGameStateFromURLParams();
export { updateURLParams, generateGameHash };
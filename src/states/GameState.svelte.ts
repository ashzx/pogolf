import type { GameStateType, shareDataType } from '../types/types.svelte';
import { golfScores } from '../metadata.svelte';
import gameLogic from '../GameLogic.svelte';
import storage from '../Storage.svelte';

let gameState = $state({
	gameStatus: 'playing',
	gameType: 'daily',
	timer: 0,
	timerIsActive: false,
	guesses: [] as string[],
	selectedGenerations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
	validPokemonList: [] as string[],
	startingPokemon: null,
	endingPokemon: null,
	invalidEndingLetters: [],
	solution: [],
	finalScore: '' as string,
	userSolution: [],
	showResults: false,
	isShared: false,
	potentialSolutions: 0,
} as GameStateType);

/**
 * Checks if the game has been won by comparing the most recent guess to the ending pokemon
 * @returns boolean if the game has been won or not
 */
const checkWinCondition = (): boolean => {
	if (gameState.guesses.length === 0) {
		return false;
	}

	const lastGuess = gameState.guesses[gameState.guesses.length - 1];
	const lastGuessEndsWith = lastGuess[lastGuess.length - 1].toLowerCase();
	const endingPokemonFirstLetter = gameState.endingPokemon?.charAt(0).toLowerCase();

	if (lastGuessEndsWith === endingPokemonFirstLetter) {
		winGame();
		return true;
	}

	return false;
}

/**
 * Sets the game status to won, shows the results screen, and adds the ending pokemon to the list of guesses to complete the solution path for the user.
 */
const winGame = () => {
	gameState.showResults = true;
	gameState.gameStatus = 'won';
	gameState.guesses.push(gameState.endingPokemon!);
	storage.storeGameState();
}

/**
 * Sets the game status to lost, shows the results screen, and calculates a solution for the user from their current position in the game. This allows the user to see how they could have won from where they are, and gives them a path to victory if they got stuck.
 */
const loseGame = () => {
	gameState.gameStatus = 'lost';
	gameState.showResults = true;

	solveForUser();
	storage.storeGameState();
}

/**
 * Calculates the score based on the number of moves taken compared to the solution.
 * @returns string as a formatted e.g. "one over par"
 */
const calculateScore = (): string => {
	// Compare number of guesses, to the solution

	const totalMoves = gameState.guesses.length - 2; // Subtract 2 to not count the starting and ending pokemon as moves
	const ourMoves = gameState.solution.length - 2; // Subtract 2 to not count the starting and ending pokemon as moves
	const diff = totalMoves - ourMoves;

	const score = golfScores[diff.toString()];
	return score || '';
}

/**
 * 
 * @returns a shareData instance for the navigator share API
 */
const shareData = (): shareDataType => {
	let shareData = {} as shareDataType;

	if (gameState.gameType === 'daily') {
		shareData = {
			title: 'I just completed the PoGolf daily word challenge!',
			text: `I completed the PoGolf daily word challenge in ${gameState.guesses.length - 2} ${gameState.guesses.length - 2 === 1 ? 'move' : 'moves'}, scoring ${calculateScore()}! Can you beat my score?`,
			url: window.location.href,
			clipboard: '',
		} as shareDataType;
	} else {
		shareData = {
			title: 'I just completed a PoGolf puzzle!',
			text: `I completed a PoGolf puzzle in ${gameState.guesses.length - 2} ${gameState.guesses.length - 2 === 1 ? 'move' : 'moves'}! Can you beat my score?`,
			url: window.location.href,
			clipboard: '',
		} as shareDataType;
	}

	shareData.clipboard = shareData.text + ' ' + shareData.url;

	return shareData;
}

/**
 * Solves the game for the user from their current position, providing a path to victory if they got stuck.
 * @returns an array of Pokémon names needed to solve the game
 */
const solveForUser = () => {
	const lastGuess = gameState.guesses[gameState.guesses.length - 1];
	// Build a win condition for the user from the current guess...

	const isSolvableResult = gameLogic.isSolvable(lastGuess, gameState.endingPokemon!);

	const itemsNeededToSolve = isSolvableResult ? isSolvableResult.slice(1, -1) : [];

	if (itemsNeededToSolve.length > 0) {
		// Add only the items needed to solve the game
		gameState.userSolution = [...itemsNeededToSolve];
	}

	return itemsNeededToSolve;
}

export { gameState, checkWinCondition, winGame, loseGame, calculateScore, shareData, solveForUser };
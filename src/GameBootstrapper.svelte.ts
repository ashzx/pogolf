import { gameState } from './states/GameState.svelte';
import { pokemon } from './metadata.svelte';
import type { gameType } from './types/types.svelte';
import gameLogic from './GameLogic.svelte';
import { updateURLParams } from './states/URLState.svelte';
import storage  from './Storage.svelte';
import { toast } from './lib/components/toast.svelte';
import { generations } from './metadata.svelte';

const gameBootstrapper = {
    start(force: boolean = false) {
        bootstrapGame(force);
    },
    changeGameMode(gameType: gameType) {
        gameState.gameType = gameType;
        gameState.startingPokemon = null;
        gameState.endingPokemon = null;
        gameState.isShared = false;
        gameState.showResults = false;
        bootstrapGame();
     },
}

/**
 * Runs when the game first loads. Builds a list of pokemon & letters from the selected generations, checks if the user provided game URL is valid and then
 * either starts the game provided in the URL or generates a new random game. Finally, it checks local storage for a saved game state and loads it if it exists, allowing users to refresh the page without losing their progress.
 * @returns void
 */
const bootstrapGame = (force: boolean = false) => {
    // Check URL params for game type
    gameState.gameStatus = 'playing';
    gameState.timer = 0;
    gameState.timerIsActive = true;
    gameState.guesses = [];

    gameState.invalidEndingLetters = buildInvalidEndingLetters();
    gameState.validPokemonList = buildValidPokemonList();

    let customGameSolvable = null;
    // Generate a valid game. Check is solvable, then start the actual game.
    if (gameState.isShared && !force) {
        // If the URL has starting and ending pokemon, use those. This allows users to share endless games with each other.
        // Check if it's solvable and game is valid
        if (!gameLogic.convertGuessToValidPokemonName(gameState.startingPokemon!) || !gameLogic.convertGuessToValidPokemonName(gameState.endingPokemon!)) {
            customGameSolvable = null;
        } else {
            customGameSolvable = gameLogic.isSolvable(gameState.startingPokemon!, gameState.endingPokemon!)   
        }
    }

    // Force a fresh game to be generated, ignoring URL params
    if (force) {
        customGameSolvable = null;
    }

    if (customGameSolvable === null) {
        const [pokemonOne, pokemonTwo, solve] = generateValidGame();
        gameState.startingPokemon = pokemonOne;
        gameState.endingPokemon = pokemonTwo;
        gameState.solution = solve;
        gameState.guesses.push(pokemonOne);
    } else {
        const pokemonOne = gameState.startingPokemon!;
        gameState.solution = customGameSolvable;
        gameState.guesses.push(pokemonOne);
    }

    // Get the game state from local storage, if it exists. This allows the user to refresh the page without losing their progress.
    storage.loadGameState();

    updateURLParams();
}

/**
 * Generates a new valid game (loops until it is solvable)
 * @returns an Array containing the starting, ending and potential solve route for the game
 */
const generateValidGame = (count: number = 0) => {
    const pokemonOne = gameLogic.generateRandomPokemon(null);
    const pokemonTwo = gameLogic.generateRandomPokemon(pokemonOne);

    const solve = gameLogic.isSolvable(pokemonOne, pokemonTwo);

    if (count > 50) {
        toast.error("Not enough generations selected to generate a valid game.");
        gameState.selectedGenerations = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        return generateValidGame(0);
    }

    if (solve === null) {
        return generateValidGame(count + 1);
    }

    return [pokemonOne, pokemonTwo, solve] as [string, string, string[]];
}

/**
 * Builds a list of potential "valid" pokemon that can be used for the game
 * @returns a list of all pokemon for daily, or all pokemon of selected generations for other game modes
 */
const buildValidPokemonList = () => {
    if (gameState.gameType === 'daily') {
        return Object.values(pokemon).flat();
    } else {
        if (gameState.selectedGenerations.length === 0) {
            gameState.selectedGenerations = [...Array(generations.length).keys()].map(i => i + 1);
        }
        return gameState.selectedGenerations.flatMap(gen => pokemon[gen]);
    }
}

/**
 * Generates a list of ending letters that cannot be used in the game because there are no pokemon that start with that letter.
 * Prevents unsolvable games where the starting pokemon ends with a letter that no valid pokemon start with. Only needs to be calculated once at the beginning of the game.
 * @returns an array of uppercase letters that represent invalid ending letters for the game
 */
const buildInvalidEndingLetters = (): string[] => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const validStartingLetters = new Set(gameState.validPokemonList.map(p => p[0].toUpperCase()));
    const validEndingLetters = new Set(gameState.validPokemonList.map(p => p[p.length - 1].toUpperCase()));

    return letters.filter(letter => validStartingLetters.has(letter) && !validEndingLetters.has(letter));
}


export default gameBootstrapper;
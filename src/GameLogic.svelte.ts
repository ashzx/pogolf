import { gameState, checkWinCondition } from './states/GameState.svelte';
import {toast} from "./lib/components/toast.svelte";
import { SvelteSet } from 'svelte/reactivity';
import storage from "./Storage.svelte";
import { pokemon } from './metadata.svelte';

/**
 * Generates a rudimentary hash for the daily game based on current date to ensure all users get the same game each day.
 * @returns number
 */
const getDailyGameHash = (): number =>  {
    let date = new Date();
    return parseInt(date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0'));
}

/**
 * Generates a kinda random number. Not a true RNG, good enough for a silly game. If a seed is provided, the random number will be the same for the same seed. This allows us to generate the same "random" game for all users each day based on the date seed. If no seed is provided, it will generate a more random number using Math.random().
 * @param seed the seed to use (for daily games) or null to generate a more (js) random game
 * @param max the upper limit of the random number (exclusive)
 * @returns number
 */
const kindaRandomNumber = (seed: number|null, max: number): number => {
    if (seed === null) {
        return Math.floor(Math.random() * max);
    }

    return Math.abs(Math.round(Math.sin(seed) * 10000 % max));
}

/**
 * Generates a random pokemon from the list. ignoring 'ignore' and incrementing the seed modifier if the generated pokemon is invalid to ensure we get the same second pokemon 
 * for a given seed in the daily game
 * @param ignore the pokemon to ignore ("starting pokemon")
 * @param seed_modifier the seed modifier to use (increments each invalid pokemon)
 * @returns string: the generated pokemon
 */
const generateRandomPokemon = (ignore: string|null, seed_modifier: number  = 0): string => {
    let seed: number|null = null;

    // Generate a random pokemon if it's the daily game. If it is unsolvable, then we increment the seed modifier, adding the 'ignore' if it exists, until we get a valid pokemon.
    if (gameState.gameType === 'daily') {
        seed = getDailyGameHash();
        seed += seed_modifier;

        if (ignore !== null) {
            seed += ignore.toString().length;
        }
    }

    const randomPokemon = gameState.validPokemonList[kindaRandomNumber(seed, gameState.validPokemonList.length)];
    const firstLetterOfRandomPokemon = randomPokemon[0].toLowerCase();
    const lastLetterOfIgnoredPokemon = ignore ? ignore[ignore.length - 1].toLowerCase() : null;

    if (firstLetterOfRandomPokemon === lastLetterOfIgnoredPokemon) {
        return generateRandomPokemon(ignore, seed_modifier + 1);
    }

    return randomPokemon;
}

/**
 * Converts a guess into a "validated" pokemon name, if possible. e.g. typing mrmime would still work for "Mr. Mime"
 * if the pokemon is not found, returns null
 * @param move the given guess
 * @param exact whether to use an exact match or a more loose comparison (stripping non alphanumeric characters and loose type matching)
 * @returns the valid pokemon name or null if not found
 */
const convertGuessToValidPokemonName = (move: string, exact: boolean = false): string|false|null => {
    // This function converts a move to a valid pokemon name by removing any extra spaces and capitalizing the first letter of each word. It also handles special cases like "Farfetch'd" and "Mr. Mime".
    const isInValidList = gameState.validPokemonList.find((p) => findPokemonCallback(p, exact, move)) || null;
    const isInFullList = Object.values(pokemon).flat().find((p) => findPokemonCallback(p, exact, move)) || null;

    if (isInValidList) {
        return isInValidList;
    } else if (isInFullList) {
        return false;
    } else {
        return null;
    }
}

const findPokemonCallback = (pokemon: string, exact: boolean = false, move: string): boolean => {
   if (!exact) {
        return pokemon.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === move.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    return pokemon.toLowerCase() === move.toLowerCase();
}

/**
 * Ensures a move provided by the player is valid. A move is valid if it fits the following criteria:
 * - It is a valid pokemon name (ignoring case and non-alphanumeric characters)
 * - It hasn't been guessed as the previous guess (mainly for palindrome pokemon e.g. rellor)
 * - It starts with the last letter of the previous guess
 * @param move the given guess
 * @returns boolean indicating whether the move is valid or not
 */
const isValidMove = (move: string): boolean => {
    const isValidGuessOrNull = convertGuessToValidPokemonName(move);
    if (isValidGuessOrNull === null) {
        toast.error("Invalid Pokémon name.");
        return false;
    }

    if (isValidGuessOrNull === false) {
        toast.error("That Pokémon isn't part of the selected generations.");
        return false;
    }

    if (isValidGuessOrNull === gameState.guesses[gameState.guesses.length - 1]) {
        toast.error("You just guessed that Pokémon.");
        return false;
    }

    // If the guess doesn't start with the ending letter of the last guess, it's invalid (unless it's the first guess, in which case it just has to be a valid pokemon name).
    if (gameState.guesses.length > 0) {
        const lastGuess = gameState.guesses[gameState.guesses.length - 1];
        const lastLetterOfLastGuess = lastGuess[lastGuess.length - 1].toLowerCase();
        const firstLetterOfCurrentGuess = isValidGuessOrNull[0].toLowerCase();

        if (lastLetterOfLastGuess !== firstLetterOfCurrentGuess) {
            toast.error(`Invalid move. Your guess must start with "${lastLetterOfLastGuess.toUpperCase()}".`);
            return false;
        }
    }

    return true;
}

/**
 * Attempts to submit a move made by the user
 * @param move the users entered move
 * @returns boolean indicating whether the move was successfully submitted (true = valid)
 */
const submitMove =  (move: string): boolean => {
    const validPokemonNameOrNull = convertGuessToValidPokemonName(move);
    if (validPokemonNameOrNull === null) {
        toast.error("Invalid Pokémon name.", 4000);
        return false;
    }

    if (validPokemonNameOrNull === false) {
        toast.error("That Pokémon isn't part of the selected generations.");
        return false;
    }

    if (!isValidMove(move)) {
        return false;
    }

    gameState.guesses.push(validPokemonNameOrNull);
    checkWinCondition();
    storage.storeGameState();

    return true;
}

/**
 * Checks if there is a valid route between 2 given pokemon. If there is, randomly returns one of the available routes.
 * @param pokemonOne - the starting pokemon
 * @param pokemonTwo - the ending pokemon
 * @returns an array representing a valid route between the two pokemon, or null if no route exists
 */
const isSolvable = (pokemonOne: string, pokemonTwo: string): Array<string>|null => {
    const solve = getSolve(pokemonOne, pokemonTwo);

    if (solve && solve.length > 0) {
        const randomIndex = Math.floor(Math.random() * solve.length);
        gameState.potentialSolutions = solve.length;
        return [...solve[randomIndex], pokemonTwo];
    }

    return null;
}

/**
 * 
 * @returns the total possible number of solutions for the current game
 */
const numberOfSolutions = (): number => {
    const solve = getSolve(gameState.startingPokemon!, gameState.endingPokemon!);
    return solve ? solve.length : 0;
}

/**
 * Finds all shortest paths between two given pokemon using BFS.
 * @param pokemonOne - the starting pokemon
 * @param pokemonTwo - the ending pokemon
 * @returns an array of arrays, each representing a shortest path between the two pokemon, or null if no path exists
 */
const getSolve = (pokemonOne: string, pokemonTwo: string): Array<string[]>|null => {
    const wordSet = new SvelteSet(gameState.validPokemonList);

    let queue: Array<string[]> = [[pokemonOne]];
    let visited = new SvelteSet<string>([pokemonOne]);
    let endLetter = pokemonTwo.charAt(0).toLowerCase();
    let shortestPotentials: Array<string[]> = [];

    // BFS by levels so we can collect all shortest paths.
    while (queue.length > 0 && shortestPotentials.length === 0) {
        const nextQueue: Array<string[]> = [];
        const levelVisited = new SvelteSet<string>();

        for (const currentPath of queue) {
            const currentWord = currentPath[currentPath.length - 1];

            if (currentWord[currentWord.length - 1].toLowerCase() === endLetter) {
                shortestPotentials.push(currentPath);
                continue;
            }

            const lastLetter = currentWord[currentWord.length - 1].toLowerCase();

            for (const word of wordSet) {
                if (word[0].toLowerCase() !== lastLetter || visited.has(word) || levelVisited.has(word)) {
                    continue;
                }

                levelVisited.add(word);
                nextQueue.push([...currentPath, word]);
            }
        }

        for (const word of levelVisited) {
            visited.add(word);
        }

        queue = nextQueue;
    }


    return shortestPotentials.length > 0 ? shortestPotentials : null;
}

const gameLogic = {
    getDailyGameHash,
    kindaRandomNumber,
    generateRandomPokemon,
    convertGuessToValidPokemonName,
    isValidMove,
    isSolvable,
    submitMove,
    numberOfSolutions,
}

export default gameLogic;
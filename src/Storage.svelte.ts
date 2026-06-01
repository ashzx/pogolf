import { toast } from "./lib/components/toast.svelte";
import {gameState, solveForUser} from "./states/GameState.svelte";
import gameLogic from "./GameLogic.svelte";

const storage = {
    storeGameState() {
        if (gameState.gameType !== 'daily') {
            return;
        }

        let state = {
            gameStatus: gameState.gameStatus,
            timer: gameState.timer,
            timerIsActive: gameState.timerIsActive,
            guesses: gameState.guesses,
            startingPokemon: gameState.startingPokemon,
            endingPokemon: gameState.endingPokemon,
            solution: gameState.solution,
            gameHash: gameLogic.getDailyGameHash(),
        };

        // Remove state from storage if the date doesn't match

        this.set('gameState', JSON.stringify(state));
    },
    loadGameState() {
        // Only load current game if it's a daily game. Otherwise, return null and let the game start as normal. This prevents issues with loading old daily game states when switching between game modes.
        if (gameState.gameType !== 'daily') {
            return null;
        }
        const stateString = this.get('gameState');
        if (!stateString) {
            return null;
        }

        const state = JSON.parse(stateString);
        if (state.gameHash !== gameLogic.getDailyGameHash()) {
            this.clearGameState();
            return null;
        }

        gameState.gameStatus = state.gameStatus;
        gameState.timer = state.timer;
        gameState.timerIsActive = state.timerIsActive;
        gameState.guesses = state.guesses;
        gameState.startingPokemon = state.startingPokemon;
        gameState.endingPokemon = state.endingPokemon;
        gameState.solution = state.solution;

        if (gameState.gameStatus !== 'playing') {
            gameState.timerIsActive = false;
            gameState.showResults = true;

            // Update user solution if they lost the game. This allows the user to see the solution even if they lose, and also allows them to share their game with others.
            if (gameState.gameStatus === 'lost') {
                solveForUser();
            }
        }

        return state;
    },
    clearGameState() {
        this.del('gameState');
    },
    read(key: string): string | null {
        return this.get(key);
    },
    get(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            toast.error('Error accessing localStorage. Your progress may not be saved.');
            return null;
        }
    },
    set(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            toast.error('Error accessing localStorage. Your progress may not be saved.');
        }
    },
    del(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            toast.error('Error accessing localStorage. Your progress may not be saved.');
        }
    },
    all(): Record<string, string> {
        try {
            const allItems: Record<string, string> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    allItems[key] = localStorage.getItem(key) ?? '';
                }
            }
            return allItems;
        } catch (error) {
            toast.error('Error accessing localStorage. Your progress may not be saved.');
            return {};
        }
    }
};

export default storage;
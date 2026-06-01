export type gameStatus = 'playing' | 'won' | 'lost';
export type gameType = 'daily' | 'endless';

export type GameStateType = {
    gameStatus: gameStatus;
    gameType: gameType;
    timer: number;
    timerIsActive: boolean;
    guesses: string[];
    potentialSolutions: number;
    isShared: boolean;
    selectedGenerations: number[];
    validPokemonList: string[];
    startingPokemon: string|null;
    endingPokemon: string|null;
    invalidEndingLetters: string[];
    solution: string[];
    userSolution: string[];
    finalScore: string;
    showResults: boolean;
}

export type shareDataType = {
    title: string;
    text: string;
    url: string;
    clipboard: string;
}

export type golfScoreType = {
    [key: string]: string;
}

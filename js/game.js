class PoGolf {
    constructor() {
        this.reset();
        this.moves = [];
        this.pokemon = this.getPokemonList();
        this.genNames = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar + Hisui', 'Paldea + Kitakami'];
        this.selectedGens = [1,2,3,4,5,6,7,8,9,10];
        this.timer = null;
        this.gameStatus = null;
        this.getGameType();

        // No pokemon end with these letters so they are impossible to move
        this.impossibleLetters = this.getImpossibleLetters();

        this.wordTemplate = document.getElementById('top-words-template').content;
        this.moveTemplate = document.getElementById('move-template').content;
        this.finalScoreMoveTemplate = document.getElementById('final-score-move-template').content;

        this.addEventListeners();
        this.addGenCheckboxes();
        this.loadCurrentState();

        this.shareIntents = {
            'facebook': 'https://www.facebook.com/sharer/sharer.php?u=',
            'x': 'https://x.com/intent/tweet?text=',
            'whatsapp': 'https://wa.me/?text=',
            'reddit': 'https://www.reddit.com/submit?url=',
            'discord': '',
        };
    }

    createGameLink() {
        return this.encodeName(this.wordOne) + '-' + this.encodeName(this.wordTwo);
    }

    getGameType() {
        const urlParams = new URLSearchParams(window.location.search);
        const game = urlParams.get('mode');
        if (game === 'endless') {
            this.gameType = 'endless';
        } else {    
            this.gameType = 'standard';
        }

        return this.gameType;
    }

    getDailyGameHash() {
        let date = new Date();
        return date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
    }

    invalidGameLink() {
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('invalid-game').classList.remove('hidden');
        document.getElementById('play-again-button-container').classList.remove('hidden');
        document.getElementById('see-results').classList.add('hidden');

        return false;
    }

    setGameLink() {
        const urlParams = new URLSearchParams(window.location.search);
        if (this.gameType === "endless") {
            urlParams.set('mode', 'endless');
            urlParams.set('game', this.createGameLink());
    
            window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
        }
        return this;
    }

    readGameLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const game = urlParams.get('game');

        if (game === null) {
            return null;
        }

        // If game doesn't include a - then it's invalid
        if (!game.includes('-')) {
            return this.invalidGameLink();
        }

        // If game includes any characters outside of a-z, 0-9, or - then it's invalid
        if (!game.match(/^[a-z0-9-]+$/)) {
            return this.invalidGameLink();
        }

        let words = game.split('-');
        const wordOne = this.decodeName(words[0]);
        const wordTwo = this.decodeName(words[1]);

        if (wordOne === null || wordTwo === null) {
            return this.invalidGameLink();
        }

        if (!this.returnPokemonFromMove(wordOne, true) || !this.returnPokemonFromMove(wordTwo, true)) {
            return this.invalidGameLink();
        }

        if (this.checkSolve(wordOne, wordTwo) === null) {
            return this.invalidGameLink();
        }

        return [wordOne, wordTwo];
    }

    encodeName(pkName) {
        let string = '';
        for (let i = 0; i < pkName.length; i++) {
            string += pkName.charCodeAt(i).toString(16);
        }

        return string;
    }

    encodeGame(gameString) {
        let string = '';
        for (let i = 0; i < gameString.length; i++) {
            string += gameString.charCodeAt(i).toString(16);
        }

        return string;
    }

    decodeGame(gameString) {
        let string = '';
        for (let i = 0; i < gameString.length; i += 2) {
            string += String.fromCharCode(parseInt(gameString.substr(i, 2), 16));
        }
        return string;
    }

    decodeName(pkName) {
        let string = '';
        for (let i = 0; i < pkName.length; i += 2) {
            string += String.fromCharCode(parseInt(pkName.substr(i, 2), 16));
        }

        return string;
    }

    play() {
        // Check the query parameters for a game
        let readGameLink = this.readGameLink();

        if (readGameLink === null) {
            // Start the game
            this.wordOne = this.getRandomMon();
            this.wordTwo = this.getRandomMon(this.wordOne);
        } else if (readGameLink === false) {
            return;
        } else {
            this.gameType = 'endless';
            [this.wordOne, this.wordTwo] = readGameLink;
        }

        // Check the solve is possible
        let solve = this.checkSolve(this.wordOne, this.wordTwo);
        if (!solve) {
            this.play();
        }

        let gameLink = this.createGameLink();
        
        this.solvePar = solve ? solve.length : null;
        this.solve = solve;

        if (this.gameType === 'standard') {
            document.querySelector('.puzzle-par-container').textContent = `Today's Challenge, ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} - Par ${this.solvePar}`;
            document.getElementById('share-game').classList.add('hidden');
            document.getElementById('daily-mode-link').classList.add('hidden');
            document.getElementById('endless-mode-link').classList.remove('hidden');
        } else {
            document.querySelector('.puzzle-par-container').textContent = `Endless Mode - Par ${this.solvePar}`;
            document.getElementById('share-game').classList.remove('hidden');
            document.getElementById('daily-mode-link').classList.remove('hidden');
            document.getElementById('endless-mode-link').classList.add('hidden');
        }

        this.addMove(this.wordOne, true);

        this.renderWords();
        this.renderMoves();

        // Check local state for a win or fail
        if (this.gameType === "standard") {
            document.querySelector('#title-mode').textContent = ' - Daily Challenge';
            if (this.gameStatus === "win") {
                this.win(false);
            } else if (this.gameStatus === "fail") {
                this.giveUp(false);
            }
        } else {
            document.querySelector('#title-mode').textContent = ' - Endless Mode';
        }

        this.setGameLink();
        return this;
    }

    refresh() {
        this.renderMoves();
        document.getElementById('move').value = '';
    }

    getImageSrc(pokemon) {
        pokemon = pokemon.replace(/\é/g, 'e');
        return "./assets/sprites/" + pokemon.toLowerCase().replace(/[^a-z]/g, '') + ".png";
    }

    renderWords() {
        let wordOne = this.wordTemplate.cloneNode(true);
        wordOne.querySelector('.pogolf-word').textContent = this.wordOne;
        wordOne.querySelector('.pogolf-image').src = this.getImageSrc(this.wordOne);

        let wordTwo = this.wordTemplate.cloneNode(true);
        wordTwo.querySelector('.pogolf-word').textContent = this.wordTwo;
        wordTwo.querySelector('.pogolf-image').src = this.getImageSrc(this.wordTwo);

        document.getElementById('word-one-container').appendChild(wordOne);
        document.getElementById('word-two-container').appendChild(wordTwo);
    }

    renderMoves() {
        document.getElementById('move-container').innerHTML = '';

        this.moves.forEach(move => {
            let moveElement = this.moveTemplate.cloneNode(true);
            moveElement.querySelector('.pogolf-word').textContent = move;
            moveElement.querySelector('.pogolf-image').src = this.getImageSrc(move);

            // If it's the last element then add "shine-quick" class
            if (move === this.moves[this.moves.length - 1]) {
                moveElement.querySelector('.pogolf-parent').classList.add('shine-quick');
            }

            document.getElementById('move-container').appendChild(moveElement);
        });
    }

    showToast(toastElement) {
        document.getElementById('toast-container').appendChild(toastElement);

        setTimeout(() => {
            let toast = document.getElementById('toast-container').firstElementChild;
            if (toast) {
                toast.remove();
            }
        }, 3000);
    }

    warning(message, clearInput = false) {
        // Display a warning message

        if (clearInput) {
            document.getElementById('move').value = '';
        }

        let template = document.getElementById('toast').content;
        let toast = template.cloneNode(true);
        toast.querySelector('.toast-text').textContent = message;
        
        this.showToast(toast);

        return this;
    }

    success(message) {
        // Display a success message
        let template = document.getElementById('toast-success').content;
        let toast = template.cloneNode(true);
        toast.querySelector('.toast-text').textContent = message;
        
        this.showToast(toast);

        return this;
    }

    convertToGolfScore(count) {
        const scores = {
            "-3": "an Albatross!",
            "-2": "an Eagle!",
            "-1" : "a Birdie!",
            "0": "a Par!",
            "1": "a Bogey!",
            "2": "a Double Bogey!",
            "3": "a Triple Bogey!",
        }

        if (count <= 3) {
            return scores[count];
        }

        return `${count} over par!`;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('opacity-0', 'pointer-events-none');
        document.getElementById(modalId).classList.add('opacity-100', 'pointer-events-auto');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('opacity-0', 'pointer-events-none');
        document.getElementById(modalId).classList.remove('opacity-100', 'pointer-events-auto');
    }

    gameEnd(shouldSave = true) {
        document.getElementById('play-again-button-container').classList.remove('hidden');
        document.getElementById('guess-form').classList.add('hidden');

        // Update the win modal with the number of moves, removing the first one
        if (this.moves.length -1 === 1) {
            document.getElementById('move-count').textContent = `${this.moves.length -1} move!`;
        } else {
            document.getElementById('move-count').textContent = `${this.moves.length -1} moves!`;
        }

        let overPar = (this.moves.length - 1) - (this.solvePar - 1);
        document.querySelectorAll('.score').forEach((e) => {
            e.textContent = this.convertToGolfScore(overPar);
        });
        this.winMessage = this.convertToGolfScore(overPar);

        // Save the state before we add the final move to the array to prevent duplication
        if (shouldSave) {
            this.saveCurrentState();
        }

        this.solve.push(this.wordTwo);

        // Add the moves we made to the modal
        document.querySelectorAll('.our-modal-moves').forEach((e) => {
            e.innerHTML = '';

            this.solve.forEach(move => {
                let moveElement = this.finalScoreMoveTemplate.cloneNode(true);
                moveElement.querySelector('.pogolf-word').textContent = move;

                e.appendChild(moveElement);
            });
        });

        if (this.readCurrentState().gameStatus === null) {
           document.querySelectorAll('.modal-play-again-daily').forEach(element => {
               element.classList.remove('hidden');
           });
        } else {
            document.querySelectorAll('.modal-play-again-daily').forEach(element => {
               element.classList.add('hidden');
           });
        }

        if (this.gameType === "endless") {
            document.getElementById('play-again').textContent = 'Play another round of endless mode';
            document.querySelectorAll('.modal-play-again').forEach(element => {
                element.textContent = 'Play another round of endless mode';
            });
        } else {
            document.getElementById('play-again').textContent = 'Try endless mode';
            document.querySelectorAll('.modal-play-again').forEach(element => {
                element.textContent = 'Try endless mode';
            });
        }
    }


    saveCurrentState() {
        if (this.gameType !== 'standard') {
            return;
        }

        let saveMoves = [...this.moves];

        console.log(saveMoves);

        let state = {
            moves: saveMoves.splice(1),
            date: this.getDailyGameHash(),
            gameStatus: this.gameStatus,
        };

        if (typeof (Storage) === "undefined") {
            return;
        } else {
            if (state.date !== this.getDailyGameHash()) {
                localStorage.removeItem('pogolf-game-state');
            }
        }

        localStorage.setItem('pogolf-game-state', this.encodeGame(JSON.stringify(state)));
    }

    loadCurrentState() {
        if (this.gameType !== 'standard') {
            return;
        }

        let state = this.readCurrentState();
        if (!state || state.blank) {
            return;
        }

        if (state.date !== this.getDailyGameHash()) {
            localStorage.removeItem('pogolf-game-state');
            return;
        }

        this.moves = state.moves;
        this.gameStatus = state.gameStatus;
    }

    readCurrentState() {
        let blankState = {
            moves: [],
            date: null,
            gameStatus: null,
            blank: true,
        };

        if (typeof (Storage) === "undefined") {
            return blankState;
        }

        let state = localStorage.getItem('pogolf-game-state');
        if (!state) {
            return blankState;
        }

        state = JSON.parse(this.decodeGame(state));

        if (state.date !== this.getDailyGameHash()) {
            localStorage.removeItem('pogolf-game-state');
            return blankState;
        }

        return state;
    }


    clearCurrentState() {
        if (typeof (Storage) === "undefined") {
            return;
        }

        localStorage.removeItem('pogolf-game-state');
    }

    win(shouldSave = true) {
        this.gameStatus = 'win';
        this.gameEnd(shouldSave);
        // Show the win modal
        this.showModal('modal');
        this.moves.push(this.wordTwo);

        let yourMoves = document.querySelector('.your-modal-moves');
        yourMoves.innerHTML = '';

        this.moves.forEach(move => {
            let moveElement = this.finalScoreMoveTemplate.cloneNode(true);
            moveElement.querySelector('.pogolf-word').textContent = move;

            yourMoves.appendChild(moveElement);
        });

        document.querySelector('.you-gave-up').classList.add('hidden');
        document.querySelector('.you-won').classList.remove('hidden');

        this.renderMoves();
    }

    addMove(move, atStart = false) {
        if (atStart) {
            this.moves.unshift(move);
            return this;
        }

        this.moves.push(move);
        this.saveCurrentState();
        return this;
    }

    returnPokemonFromMove(move, exact = false) {
        return this.pokemon.find(function (mon) {
            // Strip spaces and special characters, and make it uppercase
            if (!exact) {
                mon = mon.replace(/[^a-zA-Z]/g, '').toUpperCase();
                move = move.replace(/[^a-zA-Z]/g, '').toUpperCase();
            }

            return mon === move;
        });
    }

    move() {
        let move = document.getElementById('move').value;

        if (move === '') {
            return;
        }

        move = move.trim()

        let moveUpper = move.toUpperCase();
        let lastmove = this.moves[this.moves.length - 1].toUpperCase();

        if (this.returnPokemonFromMove(move) === undefined) {
            return this.warning('That is not a valid Pokémon', true);
        } else {
            move = this.returnPokemonFromMove(move);
            moveUpper = move.toUpperCase();
        }

        if (moveUpper === lastmove) {
            return this.warning('Why would you want to do this?', true);
        }

        if (moveUpper.charAt(0) !== lastmove.charAt(lastmove.length - 1)) {
            console.log(moveUpper, lastmove);
            return this.warning('Your move must start with the last letter of the previous Pokémon', true);
        }

        this.addMove(move);
        

        if (moveUpper.charAt(moveUpper.length - 1) === this.wordTwo.toUpperCase().charAt(0)) {
            this.win();
        } else {
            document.getElementById('move').scrollIntoView();
        }

        this.refresh();
    }

    getWinMessage() {
        if (!this.winMessage) {
            return false;
        }

        if (this.gameType === 'standard') {
            return "On PoGolf's daily challenge, I just scored " + this.winMessage + " Can you beat me? https://pogolf.app";
        } else {
            return "In PoGolf's endless mode, I just scored " + this.winMessage + " Can you beat my score? https://pogolf.app?game=" + this.createGameLink();
        }
    }

    copyWinMessageToClipboard(shareScore = false, isWin = true) {
        let winMessage = null;
        if (isWin) {
            if (!this.winMessage) {
                return;
            }

            winMessage = this.getWinMessage();
            if (shareScore) {
                winMessage += ' ||' + this.moves.join(" -> ") + "||";
            }
        } else {
            winMessage = "https://pogolf.app?game=" + this.createGameLink();
        }

        try {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(winMessage);
                this.success('Copied to clipboard');
            } else if (typeof document.execCommand !== 'undefined') {
                let textArea = document.createElement('textarea');
                textArea.value = winMessage;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.success('Copied to clipboard');
            } else {
                return this.warning('Your browser does not support copying to the clipboard');
            }
        } catch (e) {
            return this.warning('An error occurred copying to the clipboard');
        }
    }

    playAgain() {
        // Remove the ?game param from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('invalid-game').classList.add('hidden');
        document.getElementById('play-again-button-container').classList.add('hidden');
        document.getElementById('see-results').classList.remove('hidden');


        this.hideModal('modal');
        this.hideModal('modal-fail');

        // Reset the game
        this.reset().play();
        document.getElementById('move').focus();
    }

    giveUp(shouldSave = true) {
        this.gameStatus = 'fail';
        this.gameEnd(shouldSave);
        let lastGuess = this.moves[this.moves.length - 1];
        // Solve
        let checkSolve = this.checkSolve(lastGuess, this.wordTwo);
        if (!checkSolve) {
            document.querySelector('.your-modal-hint').append('No solution found');
        } else {
            checkSolve = checkSolve.slice(1);
            this.moves.push(...checkSolve);
            this.moves.push(this.wordTwo);

            let yourMovesHint = document.querySelector('.your-modal-hint');
            yourMovesHint.innerHTML = '';

            this.moves.forEach(move => {
                let moveElement = this.finalScoreMoveTemplate.cloneNode(true);
                moveElement.querySelector('.pogolf-word').textContent = move;

                yourMovesHint.appendChild(moveElement);
            });
        }

        document.querySelector('.your-modal-hint').append(`The solution was ${checkSolve.join(' -> ')}`);
        document.querySelector('.you-gave-up').classList.remove('hidden');
        document.querySelector('.you-won').classList.add('hidden');

        this.showModal('modal-fail');
    }
    
    getCheckedGens() {
        let gens = [];
        document.querySelectorAll('.generation-checkbox').forEach((checkbox) => {
            if (checkbox.checked) {
                gens.push(checkbox.value);
            }
        });

        return gens;
    }

    addGenCheckboxes() {
        this.genNames.forEach((gen, index) => {
            let genCheckboxContainer = document.createElement('div');
            genCheckboxContainer.classList.add('flex', 'items-center', 'mb-2');

            let genCheckbox = document.createElement('input');
            genCheckbox.type = 'checkbox';
            genCheckbox.id = 'gen-' + (index + 1);
            genCheckbox.value = index + 1;
            genCheckbox.checked = this.selectedGens.includes(index + 1);
            genCheckbox.classList.add('generation-checkbox', 'checkbox-lg', 'me-3', 'scale-125');

            let genLabel = document.createElement('label');
            genLabel.htmlFor = 'gen-' + index + 1;
            genLabel.textContent = gen;
            genLabel.classList.add('text-black', 'text-lg');

            genCheckboxContainer.appendChild(genCheckbox);
            genCheckboxContainer.appendChild(genLabel);

            document.getElementById('generations-container').appendChild(genCheckboxContainer);
        });
    }

    addEventListeners() {
        // Add event listeners for the game
        document.getElementById('move').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.move();
            }
        });

        document.getElementById('settings-icon').addEventListener('click', () => {
            this.showModal('modal-settings');
        });

        document.getElementById('give-up').addEventListener('click', () => {
            this.giveUp();
        });

        document.getElementById('share-game').addEventListener('click', () => {
            this.copyWinMessageToClipboard(false, false);
        });

        document.getElementById('submit-move').addEventListener('click', (e) => {
            e.preventDefault();
            this.move();
        });

        document.querySelectorAll('.closeModal').forEach(modal => {
            modal.addEventListener('click', () => {
                let target = modal.dataset.close;
                this.hideModal(target);
            });
        });

        document.getElementById('play-again').addEventListener('click', (e) => {
            this.playAgain();
        })

        document.getElementById('result-clipboard').addEventListener('click', () => {
            try {
                this.copyWinMessageToClipboard();
            } catch (e) {
                this.warning('An error occurred copying to the clipboard');
            }
        });

        document.querySelectorAll('.modal-play-again').forEach(pA => {
            pA.addEventListener('click', (e) => {
                this.playAgain();
            })
        });

        document.getElementById('see-results').addEventListener('click', () => {
            if (this.gameStatus === 'win') {
                this.showModal('modal');
            } else {
                this.showModal('modal-fail');
            }
        });

        document.querySelectorAll('.share-intent').forEach((shareIntentBtn) => {
            shareIntentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let intent = shareIntentBtn.dataset.intent;
                let url = this.getWinMessage();

                url = url.replace(/ /g, '%20');

                if (intent === "discord") {
                    this.copyWinMessageToClipboard(true);
                } else {
                    if (this.shareIntents[intent]) {

                        window.open(this.shareIntents[intent] + url, '_blank');
                    } else {
                    }
                }
            });
        });

        this.updateDailyTimer();
        this._dailyTimer = setInterval(this.updateDailyTimer(), 1000);
    }

    updateDailyTimer() {
        if (document.querySelectorAll('.daily-challenge-timer').length === 0) {
            clearInterval(this._dailyTimer);
            return;
        }
        let now = new Date();
        let next = new Date();
        next.setHours(24,0,0,0);
        let diff = next - now;
        let hours = Math.floor(diff / 1000 / 60 / 60);
        let minutes = Math.floor((diff / 1000 / 60) % 60);
        let seconds = Math.floor((diff / 1000) % 60);
        document.querySelectorAll('.daily-challenge-timer').forEach(timer => {
            timer.textContent = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        });
    }

    reset() {
        this.wordOne = null;
        this.wordTwo = null;
        this.solvePar = null;
        this.solve = null;
        this.moves = [];
        this.timer = null;
        this.gameType = "endless";

        // Show the input box
        document.getElementById('guess-form').classList.remove('hidden');
        document.getElementById('play-again-button-container').classList.add('hidden');

        // Clear the input box
        document.getElementById('move').value = '';

        // remove the guesses
        document.getElementById('word-one-container').innerHTML = '';
        document.getElementById('word-two-container').innerHTML = '';

        return this;
    }

    checkSolve(wordOne, wordTwo) {
        const wordSet = new Set(this.pokemon);

        let queue = [[wordOne]]; 
        let visited = new Set(); 
        let endLetter = wordTwo.charAt(0);
        let potentials = [];

        // BFS loop
        while (queue.length > 0) {
            let currentPath = queue.shift();  
            let currentWord = currentPath[currentPath.length - 1];

            if (currentWord[currentWord.length - 1].toLowerCase() === endLetter.toLowerCase()) {
                potentials.push(currentPath);
                break;
            }

            let lastLetter = currentWord[currentWord.length - 1].toLowerCase();

            for (let word of wordSet) {
                if (word[0].toLowerCase() === lastLetter && !visited.has(word)) {
                    visited.add(word); 
                    queue.push([...currentPath, word]);  
                }
            }
        }

        if (potentials.length > 0) {
            // Filter down to the ones that are of the same "path length" as the shortest path (the first one in the list)
            potentials = potentials.filter(e => {
                return e.length <= potentials[0].length;
            });

            // Return a random path from here
            return potentials[Math.floor(Math.random() * (potentials.length -1))]
        }

        return null;
    }

    getImpossibleLetters() {
        let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        this.pokemon.forEach(mon => {
            let lastLetter = mon.charAt(mon.length - 1).toUpperCase();
            if (letters.includes(lastLetter)) {
                letters.splice(letters.indexOf(lastLetter), 1);
            }
        });

        return letters;
    }


    getRandomMon(not = null, seed_modifier = 0) {
        let seed = null;
        // Check what gamemode we are on, use the days date as a prng seed if daily
        if (this.gameType === 'standard') {
            seed = this.getDailyGameHash();
            seed += seed_modifier;

            if (not !== null) {
                seed += not.toString().length;
            }
        }

        // Get a random pokemon from the pokedex
        let random = this.pokemon[this.kindaRandomNumberGenerator(seed, this.pokemon.length)]; //this.pokemon[Math.floor(Math.random() * this.pokemon.length)];
        let firstLetter = random.charAt(0).toUpperCase();
        let lastLetterOfNot = not !== null ? not.charAt(not.length - 1).toUpperCase() : null;

        // If the random pokemon is the same as the previous one, get a new one
        // Or the second pokemon starts with a letter that another one doesn't end with like V
        if (firstLetter === lastLetterOfNot || this.impossibleLetters.includes(firstLetter)) {
            return this.getRandomMon(not, seed_modifier + 1);
        }

        return random;
    }

    getPokemonList(gens = []) {
        let genDex = {
            "1": ["Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","Nidoran","Nidorina","Nidoqueen","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch'd","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew"], 
            "2": ["Chikorita","Bayleef","Meganium","Cyndaquil","Quilava","Typhlosion","Totodile","Croconaw","Feraligatr","Sentret","Furret","Hoothoot","Noctowl","Ledyba","Ledian","Spinarak","Ariados","Crobat","Chinchou","Lanturn","Pichu","Cleffa","Igglybuff","Togepi","Togetic","Natu","Xatu","Mareep","Flaaffy","Ampharos","Bellossom","Marill","Azumarill","Sudowoodo","Politoed","Hoppip","Skiploom","Jumpluff","Aipom","Sunkern","Sunflora","Yanma","Wooper","Quagsire","Espeon","Umbreon","Murkrow","Slowking","Misdreavus","Unown","Wobbuffet","Girafarig","Pineco","Forretress","Dunsparce","Gligar","Steelix","Snubbull","Granbull","Qwilfish","Scizor","Shuckle","Heracross","Sneasel","Teddiursa","Ursaring","Slugma","Magcargo","Swinub","Piloswine","Corsola","Remoraid","Octillery","Delibird","Mantine","Skarmory","Houndour","Houndoom","Kingdra","Phanpy","Donphan","Porygon2","Stantler","Smeargle","Tyrogue","Hitmontop","Smoochum","Elekid","Magby","Miltank","Blissey","Raikou","Entei","Suicune","Larvitar","Pupitar","Tyranitar","Lugia","Ho-Oh","Celebi"],
            "3" : ["Treecko","Grovyle","Sceptile","Torchic","Combusken","Blaziken","Mudkip","Marshtomp","Swampert","Poochyena","Mightyena","Zigzagoon","Linoone","Wurmple","Silcoon","Beautifly","Cascoon","Dustox","Lotad","Lombre","Ludicolo","Seedot","Nuzleaf","Shiftry","Taillow","Swellow","Wingull","Pelipper","Ralts","Kirlia","Gardevoir","Surskit","Masquerain","Shroomish","Breloom","Slakoth","Vigoroth","Slaking","Nincada","Ninjask","Shedinja","Whismur","Loudred","Exploud","Makuhita","Hariyama","Azurill","Nosepass","Skitty","Delcatty","Sableye","Mawile","Aron","Lairon","Aggron","Meditite","Medicham","Electrike","Manectric","Plusle","Minun","Volbeat","Illumise","Roselia","Gulpin","Swalot","Carvanha","Sharpedo","Wailmer","Wailord","Numel","Camerupt","Torkoal","Spoink","Grumpig","Spinda","Trapinch","Vibrava","Flygon","Cacnea","Cacturne","Swablu","Altaria","Zangoose","Seviper","Lunatone","Solrock","Barboach","Whiscash","Corphish","Crawdaunt","Baltoy","Claydol","Lileep","Cradily","Anorith","Armaldo","Feebas","Milotic","Castform","Kecleon","Shuppet","Banette","Duskull","Dusclops","Tropius","Chimecho","Absol","Wynaut","Snorunt","Glalie","Spheal","Sealeo","Walrein","Clamperl","Huntail","Gorebyss","Relicanth","Luvdisc","Bagon","Shelgon","Salamence","Beldum","Metang","Metagross","Regirock","Regice","Registeel","Latias","Latios","Kyogre","Groudon","Rayquaza","Jirachi","Deoxys"],
            "4": ["Turtwig","Grotle","Torterra","Chimchar","Monferno","Infernape","Piplup","Prinplup","Empoleon","Starly","Staravia","Staraptor","Bidoof","Bibarel","Kricketot","Kricketune","Shinx","Luxio","Luxray","Budew","Roserade","Cranidos","Rampardos","Shieldon","Bastiodon","Burmy","Wormadam","Mothim","Combee","Vespiquen","Pachirisu","Buizel","Floatzel","Cherubi","Cherrim","Shellos","Gastrodon","Ambipom","Drifloon","Drifblim","Buneary","Lopunny","Mismagius","Honchkrow","Glameow","Purugly","Chingling","Stunky","Skuntank","Bronzor","Bronzong","Bonsly","Mime Jr.","Happiny","Chatot","Spiritomb","Gible","Gabite","Garchomp","Munchlax","Riolu","Lucario","Hippopotas","Hippowdon","Skorupi","Drapion","Croagunk","Toxicroak","Carnivine","Finneon","Lumineon","Mantyke","Snover","Abomasnow","Weavile","Magnezone","Lickilicky","Rhyperior","Tangrowth","Electivire","Magmortar","Togekiss","Yanmega","Leafeon","Glaceon","Gliscor","Mamoswine","Porygon-Z","Gallade","Probopass","Dusknoir","Froslass","Rotom","Uxie","Mesprit","Azelf","Dialga","Palkia","Heatran","Regigigas","Giratina","Cresselia","Phione","Manaphy","Darkrai","Shaymin","Arceus"],
            "5": ["Victini","Snivy","Servine","Serperior","Tepig","Pignite","Emboar","Oshawott","Dewott","Samurott","Patrat","Watchog","Lillipup","Herdier","Stoutland","Purrloin","Liepard","Pansage","Simisage","Pansear","Simisear","Panpour","Simipour","Munna","Musharna","Pidove","Tranquill","Unfezant","Blitzle","Zebstrika","Roggenrola","Boldore","Gigalith","Woobat","Swoobat","Drilbur","Excadrill","Audino","Timburr","Gurdurr","Conkeldurr","Tympole","Palpitoad","Seismitoad","Throh","Sawk","Sewaddle","Swadloon","Leavanny","Venipede","Whirlipede","Scolipede","Cottonee","Whimsicott","Petilil","Lilligant","Basculin","Sandile","Krokorok","Krookodile","Darumaka","Darmanitan","Maractus","Dwebble","Crustle","Scraggy","Scrafty","Sigilyph","Yamask","Cofagrigus","Tirtouga","Carracosta","Archen","Archeops","Trubbish","Garbodor","Zorua","Zoroark","Minccino","Cinccino","Gothita","Gothorita","Gothitelle","Solosis","Duosion","Reuniclus","Ducklett","Swanna","Vanillite","Vanillish","Vanilluxe","Deerling","Sawsbuck","Emolga","Karrablast","Escavalier","Foongus","Amoonguss","Frillish","Jellicent","Alomomola","Joltik","Galvantula","Ferroseed","Ferrothorn","Klink","Klang","Klinklang","Tynamo","Eelektrik","Eelektross","Elgyem","Beheeyem","Litwick","Lampent","Chandelure","Axew","Fraxure","Haxorus","Cubchoo","Beartic","Cryogonal","Shelmet","Accelgor","Stunfisk","Mienfoo","Mienshao","Druddigon","Golett","Golurk","Pawniard","Bisharp","Bouffalant","Rufflet","Braviary","Vullaby","Mandibuzz","Heatmor","Durant","Deino","Zweilous","Hydreigon","Larvesta","Volcarona","Cobalion","Terrakion","Virizion","Tornadus","Thundurus","Reshiram","Zekrom","Landorus","Kyurem","Keldeo","Meloetta","Genesect"],
            "6": ["Chespin","Quilladin","Chesnaught","Fennekin","Braixen","Delphox","Froakie","Frogadier","Greninja","Bunnelby","Diggersby","Fletchling","Fletchinder","Talonflame","Scatterbug","Spewpa","Vivillon","Litleo","Pyroar","Flabébé","Floette","Florges","Skiddo","Gogoat","Pancham","Pangoro","Furfrou","Espurr","Meowstic","Honedge","Doublade","Aegislash","Spritzee","Aromatisse","Swirlix","Slurpuff","Inkay","Malamar","Binacle","Barbaracle","Skrelp","Dragalge","Clauncher","Clawitzer","Helioptile","Heliolisk","Tyrunt","Tyrantrum","Amaura","Aurorus","Sylveon","Hawlucha","Dedenne","Carbink","Goomy","Sliggoo","Goodra","Klefki","Phantump","Trevenant","Pumpkaboo","Gourgeist","Bergmite","Avalugg","Noibat","Noivern","Xerneas","Yveltal","Zygarde","Diancie","Hoopa","Volcanion"],
            "7":["Rowlet","Dartrix","Decidueye","Litten","Torracat","Incineroar","Popplio","Brionne","Primarina","Pikipek","Trumbeak","Toucannon","Yungoos","Gumshoos","Grubbin","Charjabug","Vikavolt","Crabrawler","Crabominable","Oricorio","Cutiefly","Ribombee","Rockruff","Lycanroc","Wishiwashi","Mareanie","Toxapex","Mudbray","Mudsdale","Dewpider","Araquanid","Fomantis","Lurantis","Morelull","Shiinotic","Salandit","Salazzle","Stufful","Bewear","Bounsweet","Steenee","Tsareena","Comfey","Oranguru","Passimian","Wimpod","Golisopod","Sandygast","Palossand","Pyukumuku","Type: Null","Silvally","Minior","Komala","Turtonator","Togedemaru","Mimikyu","Bruxish","Drampa","Dhelmise","Jangmo-o","Hakamo-o","Kommo-o","Tapu Koko","Tapu Lele","Tapu Bulu","Tapu Fini","Cosmog","Cosmoem","Solgaleo","Lunala","Nihilego","Buzzwole","Pheromosa","Xurkitree","Celesteela","Kartana","Guzzlord","Necrozma","Magearna","Marshadow","Poipole","Naganadel","Stakataka","Blacephalon","Zeraora","Meltan","Melmetal"],
            "8": ["Grookey","Thwackey","Rillaboom","Scorbunny","Raboot","Cinderace","Sobble","Drizzile","Inteleon","Skwovet","Greedent","Rookidee","Corvisquire","Corviknight","Blipbug","Dottler","Orbeetle","Nickit","Thievul","Gossifleur","Eldegoss","Wooloo","Dubwool","Chewtle","Drednaw","Yamper","Boltund","Rolycoly","Carkol","Coalossal","Applin","Flapple","Appletun","Silicobra","Sandaconda","Cramorant","Arrokuda","Barraskewda","Toxel","Toxtricity","Sizzlipede","Centiskorch","Clobbopus","Grapploct","Sinistea","Polteageist","Hatenna","Hattrem","Hatterene","Impidimp","Morgrem","Grimmsnarl","Obstagoon","Perrserker","Cursola","Sirfetch'd","Mr. Rime","Runerigus","Milcery","Alcremie","Falinks","Pincurchin","Snom","Frosmoth","Stonjourner","Eiscue","Indeedee","Morpeko","Cufant","Copperajah","Dracozolt","Arctozolt","Dracovish","Arctovish","Duraludon","Dreepy","Drakloak","Dragapult","Zacian","Zamazenta","Eternatus","Kubfu","Urshifu","Zarude","Regieleki","Regidrago","Glastrier","Spectrier","Calyrex","Wyrdeer","Kleavor","Ursaluna","Basculegion","Sneasler","Overqwil","Enamorus"],
            "9": ["Sprigatito","Floragato","Meowscarada","Fuecoco","Crocalor","Skeledirge","Quaxly","Quaxwell","Quaquaval","Lechonk","Oinkologne","Tarountula","Spidops","Nymble","Lokix","Pawmi","Pawmo","Pawmot","Tandemaus","Maushold","Fidough","Dachsbun","Smoliv","Dolliv","Arboliva","Squawkabilly","Nacli","Naclstack","Garganacl","Charcadet","Armarouge","Ceruledge","Tadbulb","Bellibolt","Wattrel","Kilowattrel","Maschiff","Mabosstiff","Shroodle","Grafaiai","Bramblin","Brambleghast","Toedscool","Toedscruel","Klawf","Capsakid","Scovillain","Rellor","Rabsca","Flittle","Espathra","Tinkatink","Tinkatuff","Tinkaton","Wiglett","Wugtrio","Bombirdier","Finizen","Palafin","Varoom","Revavroom","Cyclizar","Orthworm","Glimmet","Glimmora","Greavard","Houndstone","Flamigo","Cetoddle","Cetitan","Veluza","Dondozo","Tatsugiri","Annihilape","Clodsire","Farigiraf","Dudunsparce","Kingambit","Great Tusk","Scream Tail","Brute Bonnet","Flutter Mane","Slither Wing","Sandy Shocks","Iron Treads","Iron Bundle","Iron Hands","Iron Jugulis","Iron Moth","Iron Thorns","Frigibax","Arctibax","Baxcalibur","Gimmighoul","Gholdengo","Wo-Chien","Chien-Pao","Ting-Lu","Chi-Yu","Roaring Moon","Iron Valiant","Koraidon","Miraidon","Walking Wake","Iron Leaves","Dipplin","Poltchageist","Sinistcha","Okidogi","Munkidori","Fezandipiti","Ogerpon","Archaludon","Hydrapple","Gouging Fire","Raging Bolt","Iron Boulder","Iron Crown","Terapagos","Pecharunt"],
            "10": []
        };

        if (gens.length === 0) {
            gens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
        
        let pokemon = [];
        gens.forEach(gen => {
            pokemon.push(...genDex[gen]);
        });

        return pokemon;
    }

    kindaRandomNumberGenerator(seed, max) {
        if (seed === null) {
            return Math.abs(Math.round(Math.random() * max));
        }
        return Math.abs(Math.round(Math.sin(seed) * 10000 % max));
    }
}
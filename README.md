# PoGolf
A Pokémon word game inspired by Wordle. Link two Pokémon using their names in the fewest moves. The golf part just refers to the scoring system, where lower scores are better. Not affiliated with Nintendo or The Pokémon Company.

## Setup

1. Clone the repository
2. Open `index.html` in your browser
3. If you wanna build the CSS yourself, run:

```bash
npm install
npx @tailwindcss/cli -i ./assets/css/tw-import.css -o ./assets/css/styling.css
```

## The code is bad
I don't care.

## Can I steal the code?
Just make it better lol

## How to play
1. Start with two names, e.g. BULBASAUR and SKARMORY
2. Think of a connecting name that starts with that letter of the first or previous name, and ends with the starting letter of the final name. e.g. BULBASAUR -> REUNICLUS -> SKARMORY
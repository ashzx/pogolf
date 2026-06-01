# PoGolf.app
A Pokémon word game (tentatively) inspired by Wordle. Link two Pokémon using their names in the fewest moves. The golf part just refers to the scoring system, where lower scores are better. Not affiliated with Nintendo or The Pokémon Company.

## How to steal the code and run it locally
1. Clone the repository
2. Build the source using Vite e.g.

```bash
npm install
npm run build
```

3. Serve the `dist` folder using a static file server, e.g.

```bash
npx serve dist
```

## How to play
1. Start with two names, e.g. BULBASAUR and SKARMORY
2. Think of one or more connecting names that starts with the final letter of the previous name, and ends with the starting letter of the final name.
3. e.g. in this case, we need a Pokémon name that starts with R and ends with S, such as REUNICLUS.
4. Enter your guess in the 'guess' input box and click 'Submit' or press Enter.
5. If your guess is correct, it will be added to the chain and you can continue until you connect the two names.
6. The goal is to do it in the least moves possible, which will be displayed at the top of the screen as 'Par: X' where X is the minimum number of moves needed to connect the two names.
7. Come back every day for a new pair of names to connect (or play the infinite mode).

## Stack
- Svelte w/ TypeScript, for the frontend
- Vite for bundling
- Tailwind CSS for styling
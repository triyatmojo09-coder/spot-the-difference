# Spot the Difference — Five Worlds

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/triyatmojo09-coder/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/triyatmojo09-coder/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): two near-identical pictures, side by side, drawn procedurally in code — no photos, no copied art. Every scene is painted from one description, so the two panels match pixel for pixel except at the differences themselves.

## The worlds

Five hand-drawn scenes, each with 9–10 possible differences of which **6 are picked at random every play**, so no two rounds are the same:

| World | What's in it |
|---|---|
| 🌳 **Taman Pagi** | Sunny garden — tree, bench, butterfly, flower bed |
| 🍳 **Dapur Koki** | Cosy kitchen — stove, window cat, fruit bowl |
| 🏖️ **Pantai Senja** | Sunset beach — palm, umbrella, crab, boat |
| 🌲 **Hutan Rimbun** | Deep forest — owl, mushrooms, stream, fireflies |
| 🏮 **Pasar Malam** | Night market — lanterns, stalls, balloons, cat |

## How to play

1. Pick a world, then study the two pictures.
2. **Click a difference** on either picture — a gold ring marks it on both, with a chime.
3. Find all **6 differences** before the 2-minute timer runs out.
4. A wrong click costs **5 seconds**. Hints are limited to 3 per scene — a hint briefly circles an unfound difference.
5. Press **M** for the magnifier lens, **H** for a hint, **Esc** for the level select.
6. Finish fast with few mistakes to earn **3 stars**. Stars and best times are saved on your device (localStorage).

## Play it

Serve `game/` with any static server and open `game/index.html` in a desktop browser — the game is fully offline and makes zero network requests:

```sh
node serve.ts   # http://localhost:8080
```

## Files

- `game/index.html` — page, HUD and screens
- `game/style.css` — all styling
- `game/src/scenes.js` — the five worlds: scene art + difference spots
- `game/src/renderer.js` — paints a scene and draws rings, hints and bursts
- `game/src/differences.js` — random difference picks and click hit-testing
- `game/src/input.js` — panel clicks and the magnifier lens
- `game/src/hud.js` — top bar, level select, found chips, win overlay
- `game/src/storage.js` — stars, best times and progress in localStorage
- `game/src/audio.js` — WebAudio bleeps (no sound files)
- `game/src/main.js` — game controller: timer, scoring, screens
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to the output dir and writes `dossier.json`

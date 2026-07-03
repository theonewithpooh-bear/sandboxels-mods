# Sandboxels Mods

Custom mods for [Sandboxels](https://sandboxels.r74n.com/).

## singularity.js — **The Singularity** (cosmic sandbox pack)

Adds a whole new **Cosmic** category that turns the sandbox into a universe.
Every element here acts on *all* the others — that's the point.

| Element | What it does |
|---|---|
| **Black Hole** | Real cellular **gravity** — drags in surrounding matter, devours anything at its event horizon, and **grows** as it feeds. Merges with other black holes, leaks Hawking radiation, and **evaporates** in a burst when starved. |
| **Antimatter** | Touches any normal matter → both **annihilate** in a gamma flash of plasma + radiation. Chain-reacts spectacularly. |
| **Nanite** (grey goo) | **Self-replicates** into adjacent matter. Replication makes heat, so a runaway swarm cooks itself — melt it, annihilate it, or feed it to a black hole to stop it. |
| **Star** | A fusion core: radiates heat + light and **fuses nearby hydrogen into helium**, banking fuel. Overfeed it and it goes **supernova** → neutronium or a brand-new black hole. |
| **Neutronium** | Ultra-dense supernova remnant. Sinks through everything, immune to explosions. Only a black hole or antimatter can unmake it. |

| Tool (Cosmic) | What it does |
|---|---|
| **Big Bang** | A creation event — a violent, expanding burst of primordial hydrogen, helium and plasma. Shift-click = bigger bang. |
| **Gravity Well** | Pulls matter toward the cursor **without** destroying it — gather hydrogen to feed a star. Shift-click = wider reach. |
| **Supernova** | Detonate a stellar death on demand. Shift-click always collapses the core into a black hole. |

**Try this:** paint a blob of **hydrogen**, drop a **Star** in it and watch it fuse and grow → overfeed it → **supernova → black hole** → feed the black hole and watch it eat the screen → leave it alone and watch it **evaporate**. Then throw **antimatter** at the leftovers.

### Install

1. Open Sandboxels → **Mods**
2. Paste this URL and add it:

```
https://theonewithpooh-bear.github.io/sandboxels-mods/singularity.js
```

3. Reload the page. A new **Cosmic** category appears in the element picker.

> Mirror: `https://cdn.jsdelivr.net/gh/theonewithpooh-bear/sandboxels-mods@main/singularity.js`

Verified headless against the real engine (10/10 behavioural checks: gravity, devour+grow, Hawking evaporation, annihilation, goo replication, H→He fusion, supernova remnant, and all three tools).

## diamond_plus.js

Diamond is carbon — now it behaves like it.

| Feature | Detail |
|---|---|
| **Diamond melts** | At 4,027 °C diamond melts into **Liquid Diamond** |
| **Liquid Diamond** | White-hot molten carbon (Liquids category). Cool it below 3,950 °C and it recrystallises into pristine diamond — quench it with water to re-forge gems |
| **Burned Diamond** | Sustained fire slowly chars diamond instead of vanishing it into CO2. Still carbon: melt it down to re-forge, or keep burning it and it's lost as CO2 |
| **Super Incinerate** | Button in **Energy**: +4,000–6,000 °C per touch, ignites anything flammable. Shift-click: 30,000 °C instantly |
| **Freeze** | Button in **Energy**: −400–600 °C per touch, snuffs out fire. Shift-click: absolute zero |

### Install

1. Open Sandboxels → **Mods**
2. Paste this URL and add it:

```
https://theonewithpooh-bear.github.io/sandboxels-mods/diamond_plus.js
```

3. Reload the page.

> **Note:** do NOT use a `raw.githubusercontent.com` URL — GitHub serves those as
> `text/plain` with `nosniff`, so the browser refuses to execute them as a mod script.
> This repo serves mods via GitHub Pages with the correct MIME type.
> Mirror: `https://cdn.jsdelivr.net/gh/theonewithpooh-bear/sandboxels-mods@main/diamond_plus.js`

Verified headless against the **live Sandboxels v1.14** (all behavioural checks passing: melt, recrystallise, char, quench-reforge, both tools, buttons present in the element picker).

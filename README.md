# Sandboxels Mods

Custom mods for [Sandboxels](https://sandboxels.r74n.com/).

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

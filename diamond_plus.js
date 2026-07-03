/*
	diamond_plus.js — a Sandboxels mod
	----------------------------------
	Diamond is carbon: it should burn, and at extreme heat it should melt.

	• Diamond now melts at 4,027 °C into Liquid Diamond.
	• Diamond in sustained fire slowly chars into Burned Diamond
	  (instead of vanishing straight into CO2 like vanilla).
	• Liquid Diamond recrystallises into pristine Diamond below 3,950 °C,
	  so scorched gems can be melted down and re-forged.
	• Burned Diamond is still carbon: melt it back down, or keep it
	  burning and it combusts away into CO2.
	• Two new buttons in the Energy category:
	    - Super Incinerate: +4,000–6,000 °C per touch and ignites anything
	      flammable. Shift-click: 30,000 °C instantly.
	    - Freeze: −400–600 °C per touch and snuffs out fire.
	      Shift-click: absolute zero.
*/

// ===== Diamond: melts eventually =====
elements.diamond.tempHigh = 4027; // ~real melting point of carbon
elements.diamond.stateHigh = "liquid_diamond";

// Diamond is flammable carbon — sustained fire chars it
elements.diamond.burn = 2; // low ignition chance, so only prolonged fire catches
elements.diamond.burnTime = 900;
elements.diamond.burnInto = "burned_diamond";
elements.diamond.fireColor = ["#c9f5ff", "#9cd8ff", "#e8fbff"]; // pale blue carbon flame

// Vanilla turns hot diamond straight into CO2 on contact with fire/oxygen/smoke.
// Redirect those so it chars gradually into burned_diamond instead.
elements.diamond.reactions.oxygen = { elem1: "burned_diamond", elem2: null, tempMin: 900, chance: 0.02 };
elements.diamond.reactions.fire = { elem1: "burned_diamond", tempMin: 900, chance: 0.02 };
elements.diamond.reactions.smoke = { elem1: "burned_diamond", tempMin: 900, chance: 0.01 };

// ===== Liquid Diamond =====
elements.liquid_diamond = {
	color: ["#e0fffb", "#b3fff4", "#8af5ff", "#ffffff"],
	behavior: behaviors.MOLTEN, // liquid + occasional fire wisps
	temp: 4200, // placed white-hot
	tempLow: 3950,
	stateLow: "diamond", // recrystallises into pristine diamond
	viscosity: 2500,
	fireColor: ["#c9f5ff", "#9cd8ff", "#e8fbff"],
	category: "liquids",
	state: "liquid",
	density: 2900,
	hardness: 0.99,
	desc: "Molten carbon under diamond rules. Cool it below 3,950 °C and it recrystallises into pristine diamond."
};

// ===== Burned Diamond =====
elements.burned_diamond = {
	color: ["#26262b", "#33323a", "#1c1c20", "#3d3a45"],
	behavior: behaviors.POWDER,
	category: "powders",
	state: "solid",
	density: 3300,
	hardness: 0.7, // fire-weakened
	burn: 3,
	burnTime: 600,
	burnInto: "carbon_dioxide", // keep burning it and the carbon is gone
	fireColor: ["#ffb066", "#ff8c3a"],
	tempHigh: 4027,
	stateHigh: "liquid_diamond", // melt it down to re-forge
	breakInto: "charcoal",
	desc: "Fire-scorched diamond. Still carbon — melt and recool it to restore the gem, or keep burning it to lose it as CO2."
};

// ===== Super Incinerate (Energy) =====
elements.super_incinerate = {
	color: ["#fff200", "#ff8c00", "#ff3b00"],
	behavior: [
		"HT:150|HT:150|HT:150",
		"HT:150|HT:150|HT:150",
		"HT:150|HT:150|HT:150"
	],
	tool: function(pixel) {
		if (shiftDown) { pixel.temp = 30000; }
		else { pixel.temp += 4000 + Math.random() * 2000; }
		if (elements[pixel.element].burn && !pixel.burning && settings.burn !== 0) {
			burnPixel(pixel);
		}
		pixelTempCheck(pixel);
	},
	temp: 4000,
	category: "energy",
	insulate: true,
	canPlace: false,
	darkText: true,
	desc: "Superheats pixels by thousands of degrees and ignites anything flammable. Shift-click for 30,000 °C."
};

// ===== Freeze (Energy) =====
elements.freeze = {
	color: ["#bfeaff", "#7cc7ff", "#e8f8ff"],
	behavior: [
		"CO:150|CO:150|CO:150",
		"CO:150|CO:150|CO:150",
		"CO:150|CO:150|CO:150"
	],
	tool: function(pixel) {
		if (shiftDown) { pixel.temp = absoluteZero; }
		else { pixel.temp -= 400 + Math.random() * 200; }
		if (pixel.burning) { // snuff out fire
			delete pixel.burning;
			delete pixel.burnStart;
		}
		pixelTempCheck(pixel);
	},
	temp: -400,
	category: "energy",
	insulate: true,
	canPlace: false,
	darkText: true,
	desc: "Flash-freezes pixels and extinguishes fire. Shift-click for absolute zero."
};

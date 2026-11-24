import $histogram from "./histogram.js";
import $summary from "./summary.js";
import $top from "./top/index.js";
/**
 * speed command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "speed",
	describe: "Operations for quality.speed",

	routes: {
		histogram: $histogram,
		summary: $summary,
		top: $top,
	},
});

export default command;

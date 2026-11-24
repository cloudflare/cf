import $iqi from "./iqi/index.js";
import $speed from "./speed/index.js";
/**
 * quality command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quality",
	describe:
		"Internet connection quality metrics — speed, latency, and jitter by geography and ASN",

	routes: {
		iqi: $iqi,
		speed: $speed,
	},
});

export default command;

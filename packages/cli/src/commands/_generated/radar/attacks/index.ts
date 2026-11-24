import $layer3 from "./layer3/index.js";
import $layer7 from "./layer7/index.js";
/**
 * attacks command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "attacks",
	describe:
		"DDoS and application-layer attack trends, vectors, and target analysis",

	routes: {
		layer3: $layer3,
		layer7: $layer7,
	},
});

export default command;

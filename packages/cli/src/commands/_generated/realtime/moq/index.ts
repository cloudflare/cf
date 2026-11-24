import $relays from "./relays/index.js";
/**
 * moq command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "moq",
	describe: "MoQ relays for publishing and subscribing to media streams",

	routes: {
		relays: $relays,
	},
});

export default command;

import $get from "./get.js";
import $update from "./update.js";
/**
 * entrypoint command group
 * @generated from apis/overlays/rulesets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "entrypoint",
	describe:
		"The entry point ruleset of a phase, evaluated when the phase runs (e.g. http_request_firewall_custom)",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;

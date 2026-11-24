import $cachereserveclear from "./cache-reserve-clear/index.js";
import $get from "./get.js";
import $healthchecks from "./health-checks/index.js";
import $update from "./update.js";
/**
 * smart-shield command
 * @generated from apis/overlays/smart-shield.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "smart-shield",
	describe:
		"Smart Shield settings, health checks, and cache reserve management",

	routes: {
		get: $get,
		update: $update,
		"cache-reserve-clear": $cachereserveclear,
		"health-checks": $healthchecks,
	},
});

export default command;

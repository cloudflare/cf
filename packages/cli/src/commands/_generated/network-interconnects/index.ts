import $cnis from "./cnis/index.js";
import $interconnects from "./interconnects/index.js";
import $settings from "./settings/index.js";
import $slots from "./slots/index.js";
/**
 * network-interconnects command
 * @generated from apis/overlays/network-interconnects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "network-interconnects",
	describe:
		"Physical and virtual private interconnects between your infrastructure and Cloudflare's network",

	routes: {
		cnis: $cnis,
		interconnects: $interconnects,
		settings: $settings,
		slots: $slots,
	},
});

export default command;

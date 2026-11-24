import $dnssec from "./dnssec/index.js";
import $records from "./records/index.js";
import $settings from "./settings/index.js";
import $usage from "./usage/index.js";
import $views from "./views/index.js";
import $zonetransfers from "./zone-transfers/index.js";
/**
 * dns command
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe: "dns",

	routes: {
		dnssec: $dnssec,
		records: $records,
		settings: $settings,
		usage: $usage,
		views: $views,
		"zone-transfers": $zonetransfers,
	},
});

export default command;

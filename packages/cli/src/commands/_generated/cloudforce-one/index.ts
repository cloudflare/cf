import $binarystorage from "./binary-storage/index.js";
import $credentialmonitor from "./credential-monitor/index.js";
import $priorityintelligence from "./priority-intelligence/index.js";
import $requests from "./requests/index.js";
import $rules from "./rules/index.js";
import $scans from "./scans/index.js";
import $threatintel from "./threat-intel/index.js";
import $threatsignals from "./threat-signals/index.js";
/**
 * cloudforce-one command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cloudforce-one",
	describe:
		"Threat intelligence platform — request investigations, scan indicators, and track threat events",

	routes: {
		"binary-storage": $binarystorage,
		"credential-monitor": $credentialmonitor,
		"priority-intelligence": $priorityintelligence,
		requests: $requests,
		rules: $rules,
		scans: $scans,
		"threat-intel": $threatintel,
		"threat-signals": $threatsignals,
	},
});

export default command;

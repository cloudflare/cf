import $rules from "./rules/index.js";
import $siteinfo from "./site-info/index.js";
/**
 * rum command
 * @generated from apis/overlays/rum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rum",
	describe:
		"Real User Measurement (Web Analytics) — track page loads, Core Web Vitals, and visitor metrics",

	routes: {
		rules: $rules,
		"site-info": $siteinfo,
	},
});

export default command;

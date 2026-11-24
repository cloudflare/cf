import $contentfindings from "./content-findings/index.js";
import $findings from "./findings/index.js";
/**
 * data-security command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "data-security",
	describe: "Operations for query.data-security",

	routes: {
		"content-findings": $contentfindings,
		findings: $findings,
	},
});

export default command;

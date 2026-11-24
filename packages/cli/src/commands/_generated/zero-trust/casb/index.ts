import $applications from "./applications/index.js";
import $assetschemas from "./asset-schemas/index.js";
import $content from "./content/index.js";
import $exports from "./exports/index.js";
import $findingtypes from "./finding-types/index.js";
import $findings from "./findings/index.js";
import $integrations from "./integrations/index.js";
import $policies from "./policies/index.js";
import $remediations from "./remediations/index.js";
import $webhooks from "./webhooks/index.js";
/**
 * casb command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "casb",
	describe: "Operations for casb",

	routes: {
		applications: $applications,
		"asset-schemas": $assetschemas,
		content: $content,
		exports: $exports,
		"finding-types": $findingtypes,
		findings: $findings,
		integrations: $integrations,
		policies: $policies,
		remediations: $remediations,
		webhooks: $webhooks,
	},
});

export default command;

import $accountresources from "./account-resources/index.js";
import $keys from "./keys/index.js";
import $resources from "./resources/index.js";
import $summary from "./summary/index.js";
import $values from "./values/index.js";
/**
 * tags command
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "tags",

	routes: {
		"account-resources": $accountresources,
		keys: $keys,
		resources: $resources,
		summary: $summary,
		values: $values,
	},
});

export default command;

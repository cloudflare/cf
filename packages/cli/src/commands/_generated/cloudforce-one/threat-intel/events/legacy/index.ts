import $get from "./get.js";
import $graphql from "./graphql.js";
import $raw from "./raw/index.js";
import $references from "./references/index.js";
import $tags from "./tags/index.js";
/**
 * legacy command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "legacy",
	describe: "Operations for threat-intel.events.legacy",

	routes: {
		get: $get,
		graphql: $graphql,
		raw: $raw,
		references: $references,
		tags: $tags,
	},
});

export default command;

/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"access-rule-mode": {
			kind: "enum",
			brief: "The action to apply to a matched request.",
			values: [
				"block",
				"challenge",
				"whitelist",
				"js_challenge",
				"managed_challenge",
			],
			optional: true,
		},
		"configuration-target": {
			kind: "enum",
			brief: "Defines the target to search in existing rules.",
			values: ["ip", "ip_range", "asn", "country"],
			optional: true,
		},
		"configuration-value": {
			kind: "parsed",
			brief:
				"Defines the target value to search for in existing rules: an IP address, an IP address range, or a country code, depending on the provided `configuration.target`.\nNotes: You can search for a single IPv4 address, an IP address range with a subnet of '/16' or '/24', or a two-letter ISO-3166-1 alpha-2 country code.",
			optional: true,
			parse: String,
		},
		notes: {
			kind: "parsed",
			brief:
				"Defines the string to search for in the notes of existing IP Access rules.\nNotes: For example, the string 'attack' would match IP Access rules with notes 'Attack 26/02' and 'Attack 27/02'. The search is case insensitive.",
			optional: true,
			parse: String,
		},
		match: {
			kind: "enum",
			brief:
				"Defines the search requirements. When set to `all`, all the search requirements must match. When set to `any`, only one of the search requirements has to match.",
			values: ["any", "all"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Defines the requested page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Defines the maximum number of results requested.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Defines the field used to sort returned rules.",
			values: ["configuration.target", "configuration.value", "mode"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Defines the direction used to sort returned rules.",
			values: ["asc", "desc"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List IP Access rules",
	usage:
		"$0 user firewall access-rules list\n\nFetches IP Access rules of the user. You can filter the results using several optional parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"block-any-queries": {
			kind: "boolean",
			brief: "Whether to block DNS ANY queries. Optional. Defaults to true.",
			optional: true,
		},
		"burst-sensitivity": {
			kind: "parsed",
			brief: "The burst sensitivity. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		"protection-mode": {
			kind: "parsed",
			brief:
				"The mode for DNS Protection. Must be one of 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the DNS Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'.",
			optional: true,
			parse: String,
		},
		"profile-sensitivity": {
			kind: "parsed",
			brief:
				"The profile sensitivity. Recommended setting is 'low'. Must be one of 'low', 'medium', 'high', or 'very_high'.",
			optional: true,
			parse: String,
		},
		"rate-sensitivity": {
			kind: "parsed",
			brief: "The rate sensitivity. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				"The scope for the DNS Protection rule. Must be one of 'global', 'region', or 'datacenter'.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The new DNS Protection rule to add.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create DNS Protection rule.",
	usage:
		"$0 magic-transit advanced-dns-protection configs dns protection rules create\n\nCreate a DNS Protection rule for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

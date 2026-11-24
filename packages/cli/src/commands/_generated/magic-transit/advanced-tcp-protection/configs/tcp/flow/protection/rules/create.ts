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
		"burst-sensitivity": {
			kind: "parsed",
			brief: "The burst sensitivity. Must be one of 'low', 'medium', 'high'.",
			optional: true,
			parse: String,
		},
		"protection-mode": {
			kind: "parsed",
			brief:
				"The mode for the TCP Flow Protection. Must be one of 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the TCP Flow Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'.",
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
			brief: "The scope for the TCP Flow Protection rule.",
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
			brief: "The new TCP Flow Protection rule.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create TCP Flow Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection rules create\n\nCreate a TCP Flow Protection rule for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

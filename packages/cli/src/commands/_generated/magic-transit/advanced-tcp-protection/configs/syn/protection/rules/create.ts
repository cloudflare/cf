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
		"mitigation-type": {
			kind: "parsed",
			brief:
				"The type of mitigation. Must be one of 'challenge' or 'retransmit'. Optional. Defaults to 'challenge'.",
			optional: true,
			parse: String,
		},
		"protection-mode": {
			kind: "parsed",
			brief:
				"The mode for SYN Protection. Must be one of 'enabled', 'disabled', 'monitoring'.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the SYN Protection rule. Value is relative to the 'scope' setting. For 'global' scope, name should be 'global'. For either the 'region' or 'datacenter' scope, name should be the actual name of the region or datacenter, e.g., 'wnam' or 'lax'.",
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
				"The scope for the SYN Protection rule. Must be one of 'global', 'region', or 'datacenter'.",
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
			brief: "The new SYN Protection rule to add.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create SYN Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs syn protection rules create\n\nCreate a SYN Protection rule for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

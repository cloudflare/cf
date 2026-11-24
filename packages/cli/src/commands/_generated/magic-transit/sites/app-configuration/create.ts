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
		breakout: {
			kind: "boolean",
			brief:
				"Whether to breakout traffic to the app's endpoints directly. Null preserves default behavior.",
			optional: true,
		},
		"preferred-wans": {
			kind: "parsed",
			brief:
				"WAN interfaces to prefer over default WANs, highest-priority first. Can only be specified for breakout rules (breakout must be true).",
			variadic: true,
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"Priority of traffic. 0 is default, anything greater is prioritized. (Currently only 0 and 1 are supported)",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <site-id>",
	describe: "Create a new App Config",
	usage:
		"$0 magic-transit sites app-configuration create <site-id>\n\nCreates a new App Config for a site",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"account-app-id": {
			kind: "parsed",
			brief: "Magic account app ID.",
			optional: true,
			parse: String,
		},
		breakout: {
			kind: "boolean",
			brief:
				"Whether to breakout traffic to the app's endpoints directly. Null preserves default behavior.",
			optional: true,
		},
		"managed-app-id": {
			kind: "parsed",
			brief: "Managed app ID.",
			optional: true,
			parse: String,
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
	operands: [
		{ placeholder: "app-config-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <app-config-id>",
	describe: "Update an App Config",
	usage:
		"$0 magic-transit sites app-configuration update <app-config-id>\n\nUpdates an App Config for a site",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		behaviors: {
			kind: "parsed",
			brief:
				'The behaviors field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
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
			brief: "Behaviors.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update configuration for risk behaviors",
	usage:
		"$0 zero-trust risk-scoring behaviours update\n\nUpdates risk score behavior configurations, defining weights and thresholds for risk calculation.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

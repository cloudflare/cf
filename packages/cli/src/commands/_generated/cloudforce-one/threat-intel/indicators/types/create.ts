/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional description for the indicator type",
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief:
				"The indicator type to create (e.g., 'DOMAIN', 'IP', 'URL', 'HASH', 'EMAIL')",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "dataset-id", brief: "Dataset ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <dataset-id>",
	describe: "Create an indicator type",
	usage:
		"$0 cloudforce-one threat-intel indicators types create <dataset-id>\n\nCreates an indicator type in a dataset.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

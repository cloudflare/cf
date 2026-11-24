/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		data: {
			kind: "parsed",
			brief:
				'The data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "The source field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
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
		{ placeholder: "raw-id", brief: "Raw Event UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <raw-id>",
	describe: "Update raw event data by raw ID (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy raw update <raw-id>\n\nLegacy. Updates raw data stored under a `raw_id`, which new events don't use. There is no direct replacement.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

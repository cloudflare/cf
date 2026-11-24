/**
 * update command
 * @generated from apis/overlays/snippets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Define a snippet object.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief: "Provide metadata about the snippet.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "snippet-name",
			brief: "Identify the snippet.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <snippet-name>",
	describe: "Update a zone snippet",
	usage:
		"$0 snippets update <snippet-name>\n\nCreates or updates a snippet belonging to the zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

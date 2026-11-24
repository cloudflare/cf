/**
 * purge command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		refs: {
			kind: "parsed",
			brief:
				'The refs field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"ref": string}].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
		{ placeholder: "queue-id", brief: "A Resource identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "purge <queue-id>",
	describe: "Purge Peeked Queue Messages",
	usage:
		"$0 queues messages purge <queue-id>\n\nDelete messages from a Queue by using refs returned by the peek endpoint. Purging messages does not count as delivery and does not affect metrics.",
	...parameters,
	loader: () => import("./purge.handler.js"),
});

export default command;

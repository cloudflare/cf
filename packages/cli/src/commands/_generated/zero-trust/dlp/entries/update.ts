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
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update to be applied to the entry.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "entry-id", brief: "Entry ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <entry-id>",
	describe: "Update entry",
	usage: "$0 zero-trust dlp entries update <entry-id>\n\nUpdates a DLP entry.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

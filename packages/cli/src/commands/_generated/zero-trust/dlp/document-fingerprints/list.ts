/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Retrieve data about all document fingerprints.",
	usage:
		"$0 zero-trust dlp document-fingerprints list\n\nLists all document fingerprints configured for DLP scanning in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

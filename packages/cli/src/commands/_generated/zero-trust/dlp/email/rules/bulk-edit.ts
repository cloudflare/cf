/**
 * bulk-edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"new-priorities": {
			kind: "parsed",
			brief:
				'The new_priorities field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": number}.',
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
			brief: "Rule priorities.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-edit",
	describe: "Update email scanner rule priorities",
	usage:
		"$0 zero-trust dlp email rules bulk-edit\n\nReorders DLP email scanning rules by updating their priority values. Higher priority rules are evaluated first.",
	...parameters,
	loader: () => import("./bulk-edit.handler.js"),
});

export default command;
